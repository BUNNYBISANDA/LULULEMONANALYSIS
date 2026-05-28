import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import Panel from '../components/primitives/Panel'
import SectionHeader from '../components/primitives/SectionHeader'
import EmptyState from '../components/primitives/EmptyState'
import Skeleton from '../components/primitives/Skeleton'
import RatingBadge from '../components/primitives/RatingBadge'
import FilterBar from '../components/filters/FilterBar'
import ThemeMultiSelect from '../components/filters/ThemeMultiSelect'
import DateRangePicker from '../components/filters/DateRangePicker'
import TimePeriodFilter from '../components/filters/TimePeriodFilter'
import { ALL_FILTER_VALUE, LOGO_PATH } from '../data/constants'
import {
  filterReviews,
  formatShortDate,
  hasValue,
  sortReviews,
  truncateText,
} from '../data/selectors'
import { useDashboardDataset } from '../hooks/useDataset'
import { useExportRegistration } from '../hooks/useExport'
import { useFilters } from '../hooks/useFilters'
import { useProductFilter } from '../context/ProductFilterContext'

const ROWS_PER_PAGE = 25

const columnDefinitions = [
  { key: 'rating', label: 'Rating' },
  { key: 'date', label: 'Date' },
  { key: 'product', label: 'Product' },
  { key: 'theme', label: 'Theme' },
  { key: 'reviewId', label: 'Review ID' },
  { key: 'title', label: 'Title' },
  { key: 'text', label: 'Review Text' },
  { key: 'fit', label: 'Fit Feedback' },
  { key: 'images', label: 'Photo' },
  { key: 'response', label: 'Lululemon Response' },
]

export default function Reviews() {
  const { selectedProductId, selectedProductName, selectedTimePeriod } = useProductFilter()
  const { data, loading, error } = useDashboardDataset(true)
  const { filters, updateFilter, resetFilters } = useFilters({
    rating: ALL_FILTER_VALUE,
    themes: [],
    verified: ALL_FILTER_VALUE,
    from: '',
    to: '',
    sort: 'newest',
  })
  const [searchParams] = useSearchParams()
  const [expandedIds, setExpandedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const productChangeRef = useRef(false)
  const [visibleColumns, setVisibleColumns] = useState(
    Object.fromEntries(columnDefinitions.map((column) => [column.key, true])),
  )

  const filteredReviews = useMemo(() => {
    if (!data) {
      return []
    }

    return sortReviews(filterReviews(data.masterReviews, filters), filters.sort)
  }, [data, filters])
  const exportConfig = useMemo(
    () =>
      data
        ? {
            fileName: `lululemon-reviews-${selectedProductId}.csv`,
            rows: filteredReviews,
            json: filteredReviews,
          }
        : null,
    [data, filteredReviews, selectedProductId],
  )

  useExportRegistration(exportConfig)

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIndex(0)
  }, [filters, selectedTimePeriod])

  useEffect(() => {
    if (!productChangeRef.current) {
      productChangeRef.current = true
      return
    }

    resetFilters()
    setExpandedIds([])
    setCurrentPage(1)
    setSelectedIndex(0)
  }, [selectedProductId])

  useEffect(() => {
    const targetId = searchParams.get('id')
    const expand = searchParams.get('expand') === 'true'

    if (!targetId || !expand || filteredReviews.length === 0) {
      return
    }

    const rowIndex = filteredReviews.findIndex((review) => review.reviewId === targetId)
    if (rowIndex === -1) {
      return
    }

    setExpandedIds((current) => (current.includes(targetId) ? current : [...current, targetId]))
    setCurrentPage(Math.floor(rowIndex / ROWS_PER_PAGE) + 1)
    setSelectedIndex(rowIndex % ROWS_PER_PAGE)
  }, [filteredReviews, searchParams])

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ROWS_PER_PAGE))
  const paginatedRows = filteredReviews.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  )

  useEffect(() => {
    function handleKeydown(event) {
      const tagName = document.activeElement?.tagName?.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tagName)) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((index) => Math.min(index + 1, Math.max(paginatedRows.length - 1, 0)))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((index) => Math.max(index - 1, 0))
      }
      if (event.key === 'ArrowRight') {
        const selected = paginatedRows[selectedIndex]
        if (!selected) {
          return
        }

        setExpandedIds((current) =>
          current.includes(selected.reviewId) ? current : [...current, selected.reviewId],
        )
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [paginatedRows, selectedIndex])

  if (loading) {
    return <Skeleton className="h-[760px] rounded-[20px]" />
  }

  if (error || !data) {
    return <Panel className="p-8 text-sm text-[#4a4a4a]">Reviews explorer could not load.</Panel>
  }

  return (
    <div className="space-y-6">
      <Panel className="p-7 sm:p-8">
        <Link to="/analytics" className="text-sm text-[#767676] hover:text-[#000000]">
          {'<- Back to Analytics'}
        </Link>
        <SectionHeader
          eyebrow="Reviews Explorer"
          title="Browse the full low-star review set."
          description={`Filter, sort, and expand low-star reviews for ${
            selectedProductId === 'all' ? 'all loaded lululemon product styles' : selectedProductName
          }, with image evidence and brand-response context attached when available.`}
          className="mt-4"
          titlePrefix={
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
              <img
                src={LOGO_PATH}
                alt="lululemon logo"
                className="h-10 w-10 rounded-full object-contain"
              />
            </span>
          }
        />
      </Panel>

      <FilterBar>
        <div className="w-full">
          <TimePeriodFilter
            meta={`Selected period: ${data.selectedTimePeriod}. Showing ${data.periodRangeLabel}.`}
          />
        </div>
        <div className="grid flex-1 gap-3 xl:grid-cols-[0.8fr_1.3fr_0.8fr_auto_0.8fr]">
          <label className="flex flex-col gap-1 text-sm text-[#4a4a4a]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Rating
            </span>
            <select
              value={filters.rating}
              onChange={(event) => updateFilter('rating', event.target.value)}
              className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
            >
              <option value={ALL_FILTER_VALUE}>All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Star</option>
              <option value="3">3 Star</option>
            </select>
          </label>
          <ThemeMultiSelect
            value={filters.themes}
            options={data.themeOptions}
            onChange={(value) => updateFilter('themes', value)}
          />
          <label className="flex flex-col gap-1 text-sm text-[#4a4a4a]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Verified
            </span>
            <select
              value={filters.verified}
              onChange={(event) => updateFilter('verified', event.target.value)}
              className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
            >
              <option value={ALL_FILTER_VALUE}>All</option>
              <option value="true">Verified only</option>
              <option value="false">Unverified only</option>
            </select>
          </label>
          <DateRangePicker from={filters.from} to={filters.to} onChange={updateFilter} />
          <label className="flex flex-col gap-1 text-sm text-[#4a4a4a]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Sort
            </span>
            <select
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value)}
              className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="helpful">Most helpful</option>
              <option value="lowest-rating">Lowest rating</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {columnDefinitions.map((column) => (
            <button
              key={column.key}
              type="button"
              onClick={() =>
                setVisibleColumns((current) => ({
                  ...current,
                  [column.key]: !current[column.key],
                }))
              }
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                visibleColumns[column.key]
                  ? 'border-black bg-black text-white'
                  : 'border-[#e5e5e5] bg-white text-[#4a4a4a]'
              }`}
            >
              {column.label}
            </button>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs text-[#000000] hover:border-black"
          >
            Clear Filters
          </button>
        </div>
      </FilterBar>

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[#f0f0f0] px-5 py-4 text-sm text-[#4a4a4a]">
          <p>
            Showing <span className="font-semibold text-[#000000]">{filteredReviews.length}</span> of{' '}
            <span className="font-semibold text-[#000000]">{data.masterReviews.length}</span>{' '}
            low-star reviews in {data.selectedTimePeriod}
          </p>
          <p>
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {paginatedRows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No reviews found for this selection"
              description="Try a broader time period, adjust the product selector, or clear the local review filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white text-[11px] uppercase tracking-[0.18em] text-[#767676]">
                <tr>
                  {visibleColumns.rating ? <th className="px-5 py-4">Rating</th> : null}
                  {visibleColumns.date ? <th className="px-5 py-4">Date</th> : null}
                  {visibleColumns.product ? <th className="px-5 py-4">Product</th> : null}
                  {visibleColumns.theme ? <th className="px-5 py-4">Theme</th> : null}
                  {visibleColumns.reviewId ? <th className="px-5 py-4">Review ID</th> : null}
                  {visibleColumns.title ? <th className="px-5 py-4">Title</th> : null}
                  {visibleColumns.text ? <th className="px-5 py-4">Review Text</th> : null}
                  {visibleColumns.fit ? <th className="px-5 py-4">Fit Feedback</th> : null}
                  {visibleColumns.images ? <th className="px-5 py-4">Photo</th> : null}
                  {visibleColumns.response ? (
                    <th className="px-5 py-4">Lululemon Response</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((review, index) => {
                  const expanded = expandedIds.includes(review.reviewId)
                  const selected = index === selectedIndex

                  return (
                    <Fragment key={review.key}>
                      <tr
                        className={`border-t border-[#f0f0f0] align-top transition ${
                          selected ? 'bg-[#f5f5f5]' : index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'
                        }`}
                      >
                        {visibleColumns.rating ? (
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedIds((current) =>
                                  current.includes(review.reviewId)
                                    ? current.filter((item) => item !== review.reviewId)
                                    : [...current, review.reviewId],
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              <RatingBadge rating={review.rating} compact />
                              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </button>
                          </td>
                        ) : null}
                        {visibleColumns.date ? (
                          <td className="px-5 py-4 text-sm text-[#4a4a4a]">
                            {formatShortDate(review.reviewDate)}
                          </td>
                        ) : null}
                        {visibleColumns.product ? (
                          <td className="min-w-48 px-5 py-4 text-sm font-medium text-[#000000]">
                            {review.productName || '-'}
                          </td>
                        ) : null}
                        {visibleColumns.theme ? (
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-[#fafafa] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#767676]">
                              {review.complaintTheme}
                            </span>
                          </td>
                        ) : null}
                        {visibleColumns.reviewId ? (
                          <td className="px-5 py-4 text-sm text-[#4a4a4a]">{review.reviewId}</td>
                        ) : null}
                        {visibleColumns.title ? (
                          <td className="px-5 py-4 font-medium text-[#000000]">
                            {review.title || 'Untitled review'}
                          </td>
                        ) : null}
                        {visibleColumns.text ? (
                          <td className="max-w-xl px-5 py-4 text-sm leading-7 text-[#4a4a4a]">
                            {truncateText(review.reviewText, 160)}
                          </td>
                        ) : null}
                        {visibleColumns.fit ? (
                          <td className="min-w-40 px-5 py-4 text-sm text-[#4a4a4a]">
                            {review.fitFeedback || 'Not specified'}
                          </td>
                        ) : null}
                        {visibleColumns.images ? (
                          <td className="px-5 py-4">
                            {review.hasImageEvidence ? (
                              <span className="rounded-full bg-[#ffe5e8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E20010]">
                                Photo
                              </span>
                            ) : (
                              <span className="text-sm text-[#767676]">No photo</span>
                            )}
                          </td>
                        ) : null}
                        {visibleColumns.response ? (
                          <td className="px-5 py-4">
                            {hasValue(review.luluResponseText) ? (
                              <span className="rounded-full bg-[#edf6f0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f6f3e]">
                                Response
                              </span>
                            ) : (
                              <span className="text-sm text-[#767676]">No response</span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                      {expanded ? (
                        <tr className="border-t border-[#f0f0f0] bg-[#fafafa]">
                          <td
                            colSpan={
                              columnDefinitions.filter((column) => visibleColumns[column.key]).length
                            }
                            className="px-5 py-5"
                          >
                            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                                  Full Review
                                </p>
                                <p className="mt-3 text-sm leading-7 text-[#4a4a4a]">
                                  {review.reviewText}
                                </p>
                                {review.businessInsight ? (
                                  <div className="mt-4 rounded-[20px] bg-[#fafafa] p-4 text-sm leading-7 text-[#4a4a4a]">
                                    {review.businessInsight}
                                  </div>
                                ) : null}
                                {review.luluResponseText ? (
                                  <div className="mt-4 rounded-[20px] border border-[#e5e5e5] bg-white p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                                      lululemon Response
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-[#4a4a4a]">
                                      {review.luluResponseText}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                              <div className="space-y-4">
                                <div className="rounded-[20px] border border-[#e5e5e5] bg-white p-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                                    Review Metadata
                                  </p>
                                  <ul className="mt-3 space-y-2 text-sm text-[#4a4a4a]">
                                    <li>Helpful votes: {review.helpfulVotes}</li>
                                    <li>Fit feedback: {review.fitFeedback || 'Not specified'}</li>
                                    <li>
                                      Size purchased: {review.sizePurchased || 'Not specified'}
                                    </li>
                                    <li>Usual size: {review.usualSize || 'Not specified'}</li>
                                  </ul>
                                </div>
                                {review.imageUrls.length ? (
                                  <div className="rounded-[20px] border border-[#e5e5e5] bg-white p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                                      Photos
                                    </p>
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                      {review.imageUrls.slice(0, 6).map((url) => (
                                        <a
                                          key={url}
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="overflow-hidden rounded-2xl bg-[#f5f5f5]"
                                        >
                                          <img
                                            src={url}
                                            alt={review.title}
                                            loading="lazy"
                                            className="aspect-square h-full w-full object-cover"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                    <a
                                      href={review.imageUrls[0]}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-3 inline-flex items-center gap-1 text-sm text-[#767676] hover:text-[#000000]"
                                    >
                                      Open image
                                      <ExternalLink size={14} />
                                    </a>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-black/8 px-5 py-4">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000] disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </Panel>
    </div>
  )
}
