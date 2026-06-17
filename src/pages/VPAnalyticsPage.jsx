import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Download,
  Lightbulb,
  Minus,
  MessageSquareQuote,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Target,
  X,
} from 'lucide-react'
import Panel from '../components/primitives/Panel'
import SectionHeader from '../components/primitives/SectionHeader'
import Skeleton from '../components/primitives/Skeleton'
import EmptyState from '../components/primitives/EmptyState'
import RatingBadge from '../components/primitives/RatingBadge'
import ProductStyleSelect from '../components/filters/ProductStyleSelect'
import DateRangePicker from '../components/filters/DateRangePicker'
import TimePeriodFilter from '../components/filters/TimePeriodFilter'
import { LOGO_PATH } from '../data/constants'
import {
  buildQualityInsightCategories,
  calculateFactoryActionabilityScore,
  filterReviews,
  isFactoryActionable,
  resolveReviewDefectGroup,
  truncateText,
} from '../data/selectors'
import { clearLoaderCache } from '../data/loaders'
import { useDashboardDataset } from '../hooks/useDataset'
import { useExportActions, useExportRegistration } from '../hooks/useExport'
import { useFilters } from '../hooks/useFilters'
import { useProductFilter } from '../context/ProductFilterContext'
import { useImageZoom } from '../hooks/useImageZoom'

const PRIORITY_STYLES = {
  Critical: 'bg-[#ffe5e8] text-[#E20010]',
  High: 'bg-[#fff4ec] text-[#b35900]',
  Monitor: 'bg-[#f5f5f5] text-[#767676]',
}

const LEVEL_STYLES = {
  High: 'bg-[#ffe5e8] text-[#E20010]',
  Medium: 'bg-[#fff4ec] text-[#b35900]',
  Low: 'bg-[#f5f5f5] text-[#767676]',
}

function PriorityBadge({ priority, compact = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-[0.16em] ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1 text-[11px]'
      } ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Monitor}`}
    >
      {priority}
    </span>
  )
}

function LevelBadge({ level, compact = false }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-[0.16em] ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1 text-[11px]'
      } ${LEVEL_STYLES[level] || LEVEL_STYLES.Low}`}
    >
      {level}
    </span>
  )
}

function ZoomableEvidenceImage({ imageUrl, alt }) {
  const {
    scale,
    position,
    rotation,
    canZoomIn,
    canZoomOut,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useImageZoom(imageUrl)

  return (
    <>
      <div
        className={`flex max-h-[60vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-black/5 ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="max-h-[60vh] w-full select-none object-contain"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: 'center center',
            transition: scale === 1 ? 'transform 150ms ease' : 'none',
          }}
        />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={zoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom out"
          className="rounded-full border border-[#e5e5e5] p-2 text-black transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus size={14} />
        </button>
        <span className="w-12 text-center text-xs font-semibold text-black">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom in"
          className="rounded-full border border-[#e5e5e5] p-2 text-black transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset zoom"
          className="rounded-full border border-[#e5e5e5] p-2 text-black transition hover:bg-[#f5f5f5]"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </>
  )
}

function EvidenceLightbox({ evidence, onClose }) {
  useEffect(() => {
    if (!evidence) {
      return undefined
    }

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown, true)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown, true)
    }
  }, [evidence, onClose])

  if (!evidence) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close evidence"
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-black shadow-md transition hover:bg-[#f5f5f5]"
        >
          <X size={18} />
        </button>

        <ZoomableEvidenceImage key={evidence.url} imageUrl={evidence.url} alt={evidence.reviewTitle} />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <RatingBadge rating={evidence.rating} compact />
          <span className="rounded-full bg-[#fafafa] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#767676]">
            {evidence.category}
          </span>
        </div>
        <p className="mt-4 text-sm font-semibold text-black">{evidence.reviewTitle}</p>
        <p className="mt-2 text-sm leading-7 text-[#4a4a4a]">{truncateText(evidence.reviewText, 320)}</p>
      </div>
    </div>
  )
}

function CategoryEvidenceModal({ categoryLabel, reviews, onClose, onImageClick }) {
  useEffect(() => {
    if (!categoryLabel) {
      return undefined
    }

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown, true)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown, true)
    }
  }, [categoryLabel, onClose])

  if (!categoryLabel) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e5e5] p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              All Evidence — {categoryLabel}
            </p>
            <h3 className="font-display mt-2 text-xl font-semibold text-black">
              {reviews.length} review{reviews.length === 1 ? '' : 's'} in this category
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-[#e5e5e5] bg-white p-2 text-black"
            aria-label="Close evidence"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {reviews.length ? (
            reviews.map((review) => (
              <div key={review.key} className="rounded-2xl border border-[#e5e5e5] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-black">{review.title}</p>
                  <RatingBadge rating={review.rating} compact />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4a4a4a]">{review.reviewText}</p>
                {review.imageUrls?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.imageUrls.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() =>
                          onImageClick({
                            url: src,
                            reviewTitle: review.title,
                            reviewText: review.reviewText,
                            rating: review.rating,
                            category: categoryLabel,
                          })
                        }
                        className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#e5e5e5]"
                      >
                        <img
                          src={src}
                          alt="Customer evidence"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyState
              title="No reviews in this category"
              description="Try a broader time period, clear the date range, or choose a different product style."
            />
          )}
        </div>
      </div>
    </div>
  )
}

function VPAnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-44 rounded-[20px]" />
      <Skeleton className="h-64 rounded-[20px]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[20px]" />
        ))}
      </div>
      <Skeleton className="h-[360px] rounded-[20px]" />
      <Skeleton className="h-[360px] rounded-[20px]" />
    </div>
  )
}

export default function VPAnalytics() {
  const { selectedProductId, productOptions, loadingProducts, setSelectedProductId } =
    useProductFilter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedEvidence, setSelectedEvidence] = useState(null)
  const [highlightedCategory, setHighlightedCategory] = useState(null)
  const [evidenceModalCategory, setEvidenceModalCategory] = useState(null)
  const highlightTimeoutRef = useRef(null)
  const { data, loading, error } = useDashboardDataset(true, refreshKey)
  const { filters, updateFilter } = useFilters({ from: '', to: '' })
  const { downloadCsv } = useExportActions()

  useEffect(() => {
    return () => window.clearTimeout(highlightTimeoutRef.current)
  }, [])

  function handleJumpToEvidence(categoryKey) {
    const target = document.getElementById(`evidence-card-${categoryKey}`)
    if (!target) {
      return
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlightedCategory(categoryKey)
    window.clearTimeout(highlightTimeoutRef.current)
    highlightTimeoutRef.current = window.setTimeout(() => setHighlightedCategory(null), 2000)
  }

  const displayReviews = useMemo(() => {
    if (!data) {
      return []
    }

    return filterReviews(data.masterReviews, { from: filters.from, to: filters.to })
  }, [data, filters])

  const score = useMemo(() => calculateFactoryActionabilityScore(displayReviews), [displayReviews])
  const categories = useMemo(
    () => buildQualityInsightCategories(displayReviews),
    [displayReviews],
  )
  const topCategories = useMemo(() => categories.filter((row) => row.count > 0).slice(0, 3), [categories])
  const topCategoriesShare = useMemo(
    () => Number(topCategories.reduce((sum, row) => sum + row.sharePercent, 0).toFixed(1)),
    [topCategories],
  )
  const totalGuestImages = useMemo(
    () => displayReviews.reduce((sum, review) => sum + (review.imageUrls?.length || 0), 0),
    [displayReviews],
  )
  const topCategory = categories[0] && categories[0].count > 0 ? categories[0] : null
  const evidenceModalCategoryLabel =
    categories.find((row) => row.key === evidenceModalCategory)?.label || null
  const evidenceModalReviews = useMemo(() => {
    if (!evidenceModalCategory) {
      return []
    }

    return displayReviews.filter(
      (review) =>
        isFactoryActionable(review) && resolveReviewDefectGroup(review) === evidenceModalCategory,
    )
  }, [displayReviews, evidenceModalCategory])

  const executiveInsight = useMemo(() => {
    if (!topCategories.length) {
      return 'Not enough guest complaints in this period to identify a clear factory pattern yet.'
    }

    const categoryNames = topCategories.map((row) => row.label).join(', ')
    return `${score.actionableShare.toFixed(0)}% of guest complaints are linked to factory-controllable quality issues. ${categoryNames} account for ${topCategoriesShare}% of all actionable complaints.`
  }, [score.actionableShare, topCategories, topCategoriesShare])

  const exportConfig = useMemo(
    () =>
      data
        ? {
            fileName: `lululemon-production-quality-${selectedProductId}.csv`,
            rows: categories.map((row) => ({
              category: row.label,
              review_count: row.count,
              image_evidence: row.imageCount,
              share_percent: row.sharePercent,
              priority: row.priority,
              owner: row.owner,
              recommended_action: row.recommendedAction,
            })),
            json: { categories },
          }
        : null,
    [categories, data, selectedProductId],
  )

  useExportRegistration(exportConfig)

  const dataSource =
    error || !data
      ? { label: 'Preview Data', className: 'bg-[#fff4ec] text-[#b35900]' }
      : { label: 'Live Guest Data', className: 'bg-[#edf6f0] text-[#1f6f3e]' }

  function handleRefresh() {
    clearLoaderCache()
    setRefreshKey((key) => key + 1)
  }

  function handleExport() {
    if (exportConfig) {
      downloadCsv(exportConfig.fileName, exportConfig.rows)
    }
  }

  if (loading) {
    return <VPAnalyticsSkeleton />
  }

  if (error || !data) {
    return (
      <Panel className="p-8 text-sm text-[#4a4a4a]">
        Production quality intelligence could not load right now. Refresh the page and try again.
      </Panel>
    )
  }

  const hasReviews = displayReviews.length > 0
  const hasDateRange = Boolean(filters.from || filters.to)
  const evidenceCategories = categories.filter((row) => row.count > 0)
  const nextActions = categories.filter((row) => row.count > 0).slice(0, 4)

  return (
    <div className="space-y-8">
      <Panel className="p-7 sm:p-8">
        <Link to="/vp-vision" className="text-sm text-[#767676] hover:text-[#000000]">
          {'<- Back to Guest-to-Factory Intelligence'}
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
              <img
                src={LOGO_PATH}
                alt="lululemon logo"
                className="h-10 w-10 rounded-full object-contain"
              />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                Guest-to-Factory Intelligence
              </p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
                Production Quality Intelligence
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4a4a4a]">
                A real-time view of what guests are telling us about product quality — and what
                the factory should do next.
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${dataSource.className}`}
          >
            {dataSource.label}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <ProductStyleSelect
            value={selectedProductId}
            options={productOptions}
            onChange={setSelectedProductId}
            disabled={loadingProducts}
          />
          <TimePeriodFilter />
          <DateRangePicker from={filters.from} to={filters.to} onChange={updateFilter} />
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:border-black"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={!exportConfig}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E20010] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            Export
          </button>
          {hasDateRange ? (
            <button
              type="button"
              onClick={() => {
                updateFilter('from', '')
                updateFilter('to', '')
              }}
              className="text-sm text-[#767676] hover:text-black"
            >
              Clear date range
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-sm text-[#767676]">
          Anchored to latest review date: {data.anchorDateLabel}. Showing {data.periodRangeLabel}
          {hasDateRange ? ', narrowed by the custom date range above.' : '.'}
        </p>
      </Panel>

      {hasReviews ? (
        <>
          <Panel className="p-7 sm:p-8">
            <SectionHeader eyebrow="Executive Summary" title="What Are Guests Telling Us?" />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                <MessageSquareQuote size={18} className="text-[#767676]" />
                <p className="font-display mt-3 text-2xl font-semibold text-black">{score.total}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                  Reviews Analyzed
                </p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                <ShieldCheck size={18} className="text-[#767676]" />
                <p className="font-display mt-3 text-2xl font-semibold text-black">
                  {score.actionableShare.toFixed(0)}%
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                  Factory Actionable
                </p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                <Camera size={18} className="text-[#767676]" />
                <p className="font-display mt-3 text-2xl font-semibold text-black">{totalGuestImages}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                  Guest Images Collected
                </p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                <AlertTriangle size={18} className="text-[#767676]" />
                <p className="font-display mt-3 text-2xl font-semibold text-black">
                  {topCategory?.label || 'None'}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                  Highest Risk Area
                </p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                <Target size={18} className="text-[#767676]" />
                <p className="font-display mt-3 text-base font-semibold leading-6 text-black">
                  {topCategory?.issueLabel || 'No leading concern yet'}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                  Top Quality Concern
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-[20px] border border-[#f1c7cb] bg-[#fff9fa] p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#E20010]">
                <Lightbulb size={20} />
              </span>
              <p className="font-display text-lg font-semibold leading-7 text-black sm:text-xl">
                {executiveInsight}
              </p>
            </div>
          </Panel>

          <Panel className="p-7 sm:p-8">
            <SectionHeader eyebrow="Quality Priorities" title="Where Should We Focus First?" />

            <div className="mt-6 space-y-2">
              {categories.map((row) => {
                const isClickable = row.count > 0
                const content = (
                  <>
                    <div className="flex items-center gap-2 sm:w-44 sm:shrink-0">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a8a8a8]">
                        #{row.officialRank}
                      </span>
                      <p className="text-sm font-semibold text-black">{row.label}</p>
                    </div>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div
                        className="h-full rounded-full bg-[#E20010]"
                        style={{ width: `${row.barWidth}%` }}
                      />
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-3 sm:w-40">
                      <span className="text-sm font-semibold text-black">
                        {row.count} review{row.count === 1 ? '' : 's'}
                      </span>
                      <span className="text-sm text-[#767676]">{row.sharePercent}%</span>
                    </div>
                    {isClickable ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#767676] transition group-hover:text-[#E20010] sm:w-28 sm:opacity-0 sm:group-hover:opacity-100">
                        View Evidence
                        <ArrowRight size={13} />
                      </span>
                    ) : null}
                  </>
                )

                if (!isClickable) {
                  return (
                    <div
                      key={row.key}
                      className="flex flex-col gap-2 rounded-2xl px-3 py-2 sm:flex-row sm:items-center sm:gap-4"
                    >
                      {content}
                    </div>
                  )
                }

                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => handleJumpToEvidence(row.key)}
                    className="group flex w-full flex-col gap-2 rounded-2xl px-3 py-2 text-left transition hover:bg-[#fafafa] sm:flex-row sm:items-center sm:gap-4"
                  >
                    {content}
                  </button>
                )
              })}
            </div>

            {topCategories.length ? (
              <div className="mt-6 rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5 text-sm leading-6 text-[#4a4a4a]">
                <span className="font-display font-semibold text-black">
                  {topCategoriesShare}% of all quality complaints
                </span>{' '}
                originate from the top {topCategories.length} categor
                {topCategories.length === 1 ? 'y' : 'ies'}.
              </div>
            ) : null}
          </Panel>

          <Panel className="p-7 sm:p-8">
            <SectionHeader
              eyebrow="Visual Evidence"
              title="See the Issues Guests Are Reporting"
              description="Tap any photo to view it full-size alongside the guest's own words."
            />

            {evidenceCategories.length ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {evidenceCategories.map((row) => {
                  const Icon = row.icon
                  const isHighlighted = highlightedCategory === row.key
                  return (
                    <div
                      key={row.key}
                      id={`evidence-card-${row.key}`}
                      className={`flex scroll-mt-28 flex-col rounded-[20px] border bg-white p-5 transition-all duration-700 ${
                        isHighlighted
                          ? 'border-[#E20010] shadow-[0_0_0_4px_rgba(226,0,16,0.16),0_0_28px_rgba(226,0,16,0.35)]'
                          : 'border-[#e5e5e5]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fafafa] text-black">
                          {Icon ? <Icon size={16} /> : null}
                        </span>
                        <PriorityBadge priority={row.priority} compact />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-black">{row.label}</p>
                      <p className="mt-1 text-xs text-[#767676]">
                        {row.count} complaint{row.count === 1 ? '' : 's'} | {row.imageCount} photo
                        {row.imageCount === 1 ? '' : 's'}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#4a4a4a]">{row.issueLabel}</p>

                      {row.evidenceImages.length ? (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                          {row.evidenceImages.map((evidence) => (
                            <button
                              key={evidence.key}
                              type="button"
                              onClick={() =>
                                setSelectedEvidence({ ...evidence, category: row.label })
                              }
                              className="aspect-square overflow-hidden rounded-lg border border-[#e5e5e5]"
                            >
                              <img
                                src={evidence.url}
                                alt={row.label}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 flex h-16 items-center justify-center rounded-lg bg-[#fafafa] text-[#a8a8a8]">
                          <Camera size={20} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setEvidenceModalCategory(row.key)}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-semibold text-black transition hover:border-black"
                      >
                        View All Evidence
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No quality evidence in this selection"
                  description="Try a broader time period, clear the date range, or choose a different product style."
                />
              </div>
            )}
          </Panel>

          <Panel className="p-7 sm:p-8">
            <SectionHeader
              eyebrow="Factory Action Board"
              title="What Should Each Team Do Next?"
              description="Ranked by impact — the top card needs attention first."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((row, index) => (
                <div
                  key={row.key}
                  className={`flex flex-col rounded-[20px] border p-5 ${
                    index === 0 && row.count > 0
                      ? 'border-[#f1c7cb] bg-[#fff9fa]'
                      : 'border-[#e5e5e5] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-semibold text-black">{row.label}</p>
                    <PriorityBadge priority={row.priority} compact />
                  </div>

                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#767676]">
                    Issue
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#4a4a4a]">{row.issueLabel}</p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#767676]">
                        Evidence
                      </p>
                      <p className="mt-1 text-sm font-semibold text-black">
                        {row.count} complaint{row.count === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#767676]">
                        Impact
                      </p>
                      <p className="mt-1 text-sm font-semibold text-black">{row.sharePercent}%</p>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#767676]">
                    Owner
                  </p>
                  <p className="mt-1 text-sm text-black">{row.owner}</p>

                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#767676]">
                    Recommended Action
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#4a4a4a]">{row.recommendedAction}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-7 sm:p-8">
            <SectionHeader eyebrow="Risk Heatmap" title="Priority at a Glance" />

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-[0.16em] text-[#767676]">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Impact</th>
                    <th className="px-4 py-3">Evidence Strength</th>
                    <th className="px-4 py-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((row) => {
                    const Icon = row.icon
                    return (
                      <tr key={row.key} className="border-t border-[#f0f0f0]">
                        <td className="flex items-center gap-2 px-4 py-3 font-medium text-black">
                          {Icon ? <Icon size={15} className="text-black" /> : null}
                          {row.label}
                        </td>
                        <td className="px-4 py-3">
                          <LevelBadge level={row.impactLevel} compact />
                        </td>
                        <td className="px-4 py-3">
                          <LevelBadge level={row.evidenceStrength} compact />
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority={row.priority} compact />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel className="p-7 sm:p-8">
            <SectionHeader eyebrow="Next Steps" title="Recommended Factory Actions" />

            {nextActions.length ? (
              <ol className="mt-6 space-y-4">
                {nextActions.map((row, index) => (
                  <li key={row.key} className="flex items-start gap-4">
                    <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <p className="mt-1 text-base leading-7 text-black">{row.recommendedAction}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="No recommended actions yet"
                  description="Try a broader time period, clear the date range, or choose a different product style."
                />
              </div>
            )}
          </Panel>
        </>
      ) : (
        <Panel className="p-7 sm:p-8">
          <EmptyState
            title="No low-star reviews in this selection"
            description="Try a broader time period, clear the date range, or choose a different product style."
          />
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Link to="/gallery">
          <Panel className="p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Quick Link
            </p>
            <h3 className="font-display mt-3 text-2xl font-semibold text-[#000000]">
              View Image Evidence Gallery
            </h3>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#4a4a4a]">
              Open the full customer photo gallery
              <ArrowRight size={15} />
            </p>
          </Panel>
        </Link>
        <Link to="/reviews">
          <Panel className="p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Quick Link
            </p>
            <h3 className="font-display mt-3 text-2xl font-semibold text-[#000000]">
              Browse all reviews
            </h3>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#4a4a4a]">
              Open the review explorer
              <ArrowRight size={15} />
            </p>
          </Panel>
        </Link>
      </div>

      <CategoryEvidenceModal
        categoryLabel={evidenceModalCategoryLabel}
        reviews={evidenceModalReviews}
        onClose={() => setEvidenceModalCategory(null)}
        onImageClick={setSelectedEvidence}
      />

      <EvidenceLightbox evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
    </div>
  )
}
