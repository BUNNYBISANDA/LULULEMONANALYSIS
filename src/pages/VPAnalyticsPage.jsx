import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Download, Lightbulb, RefreshCw, Target, X } from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import Panel from '../components/primitives/Panel'
import SectionHeader from '../components/primitives/SectionHeader'
import Skeleton from '../components/primitives/Skeleton'
import EmptyState from '../components/primitives/EmptyState'
import RatingBadge from '../components/primitives/RatingBadge'
import RiskBadge from '../components/primitives/RiskBadge'
import ImageLightbox from '../components/ImageLightbox'
import ProductStyleSelect from '../components/filters/ProductStyleSelect'
import DateRangePicker from '../components/filters/DateRangePicker'
import TimePeriodFilter from '../components/filters/TimePeriodFilter'
import { LOGO_PATH } from '../data/constants'
import {
  buildOperationRiskHeatmap,
  buildProductionDefectMatrix,
  buildProductionEvidenceWall,
  buildQualityInsightCategories,
  buildSewerQAActionBoard,
  calculateFactoryActionabilityScore,
  filterGalleryItems,
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

function riskFill(level) {
  if (level === 'High') {
    return '#E20010'
  }

  if (level === 'Medium') {
    return '#f0a04b'
  }

  return '#a8a8a8'
}

function median(values = []) {
  if (!values.length) {
    return 0
  }

  const sorted = [...values].sort((left, right) => left - right)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function PriorityPill({ priority }) {
  const classes =
    priority === 'P1'
      ? 'bg-[#ffe5e8] text-[#E20010]'
      : priority === 'P2'
        ? 'bg-[#fff4ec] text-[#b35900]'
        : priority === 'Excluded'
          ? 'bg-[#f0f0f0] text-[#a8a8a8]'
          : 'bg-[#f5f5f5] text-[#767676]'

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${classes}`}
    >
      {priority}
    </span>
  )
}

const LEGACY_CATEGORY_LABELS = [
  'Sizing & Fit',
  'Fabric & Material Quality',
  'Color & Product Description',
  'Customer Service',
]

function formatSimilarityScore(value) {
  const score = Number(value)
  return Number.isFinite(score) ? score.toFixed(4) : '0.0000'
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const entry = payload[0]
  const total = entry.payload?.total || 0
  const share = total ? ((entry.value / total) * 100).toFixed(1) : '0.0'

  return (
    <div className="w-40 rounded-2xl border border-[#e5e5e5] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#767676]">{entry.name}</p>
      <p className="font-display mt-1 text-xl font-semibold text-black">{entry.value}</p>
      <p className="mt-1 text-xs text-[#767676]">{share}% of low-star reviews</p>
    </div>
  )
}

function BubbleTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
      <p className="font-semibold text-black">{point.label}</p>
      <p className="mt-1 text-[#4a4a4a]">
        {point.x} reviews | {point.y.toFixed(0)}% evidence strength | {point.z} images
      </p>
    </div>
  )
}

function QualityEvidenceDrawer({ category, reviews, onClose, onImageClick }) {
  useEffect(() => {
    if (!category) {
      return undefined
    }

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [category, onClose])

  if (!category) {
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
              Evidence — {category.label}
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
                  <div className="mt-3 flex gap-2">
                    {review.imageUrls.slice(0, 4).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => onImageClick({ url: src, alt: review.title })}
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
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#767676]">
                  <span className="rounded-full bg-[#fafafa] px-3 py-1">
                    Group: {review.matchedDefectGroup || 'Unclassified'}
                  </span>
                  <span className="rounded-full bg-[#fafafa] px-3 py-1">
                    Match confidence: {Math.round((review.similarityScore || 0) * 100)}%
                  </span>
                </div>
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
      <Skeleton className="h-[380px] rounded-[20px]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[20px]" />
        ))}
      </div>
      <Skeleton className="h-[400px] rounded-[20px]" />
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-[360px] rounded-[20px]" />
      ))}
    </div>
  )
}

export default function VPAnalytics() {
  const { selectedProductId, productOptions, loadingProducts, setSelectedProductId } =
    useProductFilter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [showNonProduction, setShowNonProduction] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [selectedQualityGroup, setSelectedQualityGroup] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const { data, loading, error } = useDashboardDataset(true, refreshKey)
  const { filters, updateFilter } = useFilters({ from: '', to: '' })
  const { downloadCsv } = useExportActions()

  useEffect(() => {
    const query = window.matchMedia('(min-width: 640px)')
    const updateMatch = () => setIsDesktop(query.matches)
    updateMatch()
    query.addEventListener('change', updateMatch)
    return () => query.removeEventListener('change', updateMatch)
  }, [])

  const displayReviews = useMemo(() => {
    if (!data) {
      return []
    }

    return filterReviews(data.masterReviews, { from: filters.from, to: filters.to })
  }, [data, filters])

  const displayImages = useMemo(() => {
    if (!data) {
      return []
    }

    return filterGalleryItems(data.imageItems, {
      from: filters.from,
      to: filters.to,
      sortBy: 'newest',
    })
  }, [data, filters])

  const score = useMemo(() => calculateFactoryActionabilityScore(displayReviews), [displayReviews])
  const matrixRows = useMemo(() => buildProductionDefectMatrix(displayReviews), [displayReviews])
  const heatmapRows = useMemo(
    () => buildOperationRiskHeatmap(displayReviews).filter((row) => row.isProduction),
    [displayReviews],
  )
  const actionBoardRows = useMemo(() => buildSewerQAActionBoard(displayReviews), [displayReviews])
  const qualityInsightCategories = useMemo(
    () => buildQualityInsightCategories(displayReviews),
    [displayReviews],
  )
  const evidenceDrawerCategory = useMemo(
    () => qualityInsightCategories.find((row) => row.key === selectedQualityGroup) || null,
    [qualityInsightCategories, selectedQualityGroup],
  )
  const evidenceDrawerReviews = useMemo(
    () =>
      selectedQualityGroup
        ? displayReviews.filter((review) => resolveReviewDefectGroup(review) === selectedQualityGroup)
        : [],
    [displayReviews, selectedQualityGroup],
  )
  const topQualityConcerns = useMemo(
    () => qualityInsightCategories.filter((row) => row.count > 0).slice(0, 3),
    [qualityInsightCategories],
  )
  const topQualityConcernsShare = useMemo(
    () => Number(topQualityConcerns.reduce((sum, row) => sum + row.sharePercent, 0).toFixed(1)),
    [topQualityConcerns],
  )
  const qualityKeyFindings = useMemo(() => {
    const findings = []
    const totalCategorized = qualityInsightCategories.reduce((sum, row) => sum + row.count, 0)
    const top = qualityInsightCategories[0]
    const second = qualityInsightCategories[1]

    if (top && top.count > 0) {
      findings.push(
        `${top.label} ranks #1 in the official defect group view (${top.count} review${top.count === 1 ? '' : 's'}, ${top.sharePercent}%).`,
      )
    }

    if (topQualityConcerns.length > 1) {
      findings.push(
        `The top ${topQualityConcerns.length} official groups account for ${topQualityConcernsShare}% of factory-actionable quality issues.`,
      )
    }

    if (top && top.averageSimilarity > 0) {
      findings.push(`${top.label} matches the official group definition with ${top.averageSimilarity}% average similarity.`)
    }

    const imageBackedCount = qualityInsightCategories.reduce(
      (sum, row) => sum + row.imageBackedReviewCount,
      0,
    )
    if (totalCategorized > 0 && imageBackedCount > 0) {
      const imageSharePercent = Number(((imageBackedCount / totalCategorized) * 100).toFixed(1))
      findings.push(
        `${imageBackedCount} report${imageBackedCount === 1 ? '' : 's'} (${imageSharePercent}%) include customer photo evidence.`,
      )
    }

    if (second && second.count > 0) {
      findings.push(`${second.label} is the second most common concern reported by guests.`)
    }

    return findings
  }, [qualityInsightCategories, topQualityConcerns, topQualityConcernsShare])
  const defectDebugGroups = useMemo(() => {
    const officialGroupKeys = new Set(qualityInsightCategories.map((row) => row.key))

    return qualityInsightCategories.map((category) => {
      const reviews = displayReviews
        .filter(
          (review) =>
            isFactoryActionable(review) &&
            officialGroupKeys.has(review.matchedDefectGroup) &&
            review.matchedDefectGroup === category.key,
        )
        .sort((left, right) => right.similarityScore - left.similarityScore)
        .slice(0, 20)

      return {
        ...category,
        reviews,
      }
    })
  }, [displayReviews, qualityInsightCategories])
  const legacyDebugRows = useMemo(
    () =>
      LEGACY_CATEGORY_LABELS.map((label) => ({
        label,
        rawMatchedGroupCount: displayReviews.filter((review) => review.matchedDefectGroup === label)
          .length,
      })).filter((row) => row.rawMatchedGroupCount > 0),
    [displayReviews],
  )
  const rankingVerification = useMemo(() => {
    const officialGroupKeys = new Set(qualityInsightCategories.map((row) => row.key))
    const exactOfficialGroupCount = displayReviews.filter(
      (review) =>
        isFactoryActionable(review) && officialGroupKeys.has(review.matchedDefectGroup),
    ).length
    const finalRankingCount = qualityInsightCategories.reduce((sum, row) => sum + row.count, 0)
    const legacyGroupsUsed = qualityInsightCategories.filter((row) =>
      LEGACY_CATEGORY_LABELS.includes(row.key),
    )
    const matchedReviews = displayReviews.filter(
      (review) => isFactoryActionable(review) && officialGroupKeys.has(review.matchedDefectGroup),
    )
    const averageGroupSimilarity = matchedReviews.length
      ? Number(
          (
            (matchedReviews.reduce((sum, review) => sum + (review.similarityScore || 0), 0) /
              matchedReviews.length) *
            100
          ).toFixed(1),
        )
      : 0

    return {
      exactOfficialGroupCount,
      finalRankingCount,
      groupedByMatchedDefectGroupOnly: exactOfficialGroupCount === finalRankingCount,
      averageGroupSimilarity,
      legacyGroupsUsedCount: legacyGroupsUsed.length,
      legacyRawCount: legacyDebugRows.reduce((sum, row) => sum + row.rawMatchedGroupCount, 0),
    }
  }, [displayReviews, legacyDebugRows, qualityInsightCategories])
  const rawEvidence = useMemo(
    () => buildProductionEvidenceWall(displayReviews, displayImages, 8),
    [displayReviews, displayImages],
  )
  const productionEvidence = useMemo(
    () =>
      [...rawEvidence].sort((left, right) => {
        const leftHasImage = left.imageUrl ? 1 : 0
        const rightHasImage = right.imageUrl ? 1 : 0
        return rightHasImage - leftHasImage || right.confidenceScore - left.confidenceScore
      }),
    [rawEvidence],
  )
  const nonProductionEvidence = useMemo(() => {
    if (!showNonProduction) {
      return []
    }

    return displayReviews
      .filter((review) => !isFactoryActionable(review))
      .slice(0, 8)
      .map((review) => ({
        key: review.key,
        rating: review.rating,
        reviewText: review.reviewText,
        category: 'Non-Production',
        operationArea: 'Not factory actionable',
        priority: 'Excluded',
        imageUrl: null,
      }))
  }, [displayReviews, showNonProduction])

  const actionableMatrixRows = useMemo(
    () => matrixRows.filter((row) => row.isProduction),
    [matrixRows],
  )

  const bubbleData = useMemo(
    () =>
      actionableMatrixRows.map((row) => ({
        key: row.key,
        label: row.heatmapLabel,
        x: row.count,
        y: row.count ? Number(((row.imageCount / row.count) * 100).toFixed(1)) : 0,
        z: row.imageCount,
        riskLevel: row.riskLevel,
      })),
    [actionableMatrixRows],
  )
  const bubbleMedianX = useMemo(() => median(bubbleData.map((point) => point.x)), [bubbleData])
  const bubbleMedianY = useMemo(() => median(bubbleData.map((point) => point.y)), [bubbleData])

  const priorityByKey = useMemo(
    () => new Map(actionBoardRows.map((row) => [row.key, row.priority])),
    [actionBoardRows],
  )
  const ownerBoardRows = useMemo(
    () =>
      [...actionableMatrixRows]
        .map((row) => ({ ...row, priority: priorityByKey.get(row.key) || 'P3' }))
        .sort((left, right) => right.count - left.count),
    [actionableMatrixRows, priorityByKey],
  )

  const exportConfig = useMemo(
    () =>
      data
        ? {
            fileName: `lululemon-production-quality-${selectedProductId}.csv`,
            rows: matrixRows.map((row) => ({
              production_category: row.label,
              review_count: row.count,
              image_evidence: row.imageCount,
              risk_level: row.riskLevel,
              operation_area: row.operationArea,
              owner: row.owner,
              recommended_prevention_action: row.preventionAction,
            })),
            json: { matrixRows, heatmapRows, actionBoardRows },
          }
        : null,
    [actionBoardRows, data, heatmapRows, matrixRows, selectedProductId],
  )

  useExportRegistration(exportConfig)

  const dataSource =
    error || !data
      ? { label: 'Sample Fallback Data', className: 'bg-[#fff4ec] text-[#b35900]' }
      : { label: 'Processed CSV Data', className: 'bg-[#edf6f0] text-[#1f6f3e]' }

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
  const donutData = [
    { name: 'Factory Actionable', value: score.actionable, total: score.total, fill: '#E20010' },
    { name: 'Non-Production', value: score.nonProduction || 0, total: score.total, fill: '#e5e5e5' },
  ]
  const evidenceWallItems = [...productionEvidence, ...nonProductionEvidence]
  const hasBubbles = bubbleData.some((point) => point.x > 0)

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
                Factory Quality Intelligence
              </p>
              <h1 className="font-display mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
                Production Quality Intelligence
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4a4a4a]">
                Translating Lululemon guest complaints into factory-actionable defect signals,
                operation risk areas, and preventive quality actions.
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

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Factory Actionability Score"
          title="How much of this guest dissatisfaction can become factory action?"
        />
        {hasReviews ? (
          <div className="mt-8 grid gap-10 sm:grid-cols-[360px_1fr] sm:items-center">
            <div className="relative mx-auto w-full" style={{ height: isDesktop ? 220 : 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx={isDesktop ? '32%' : '50%'}
                    cy={isDesktop ? '50%' : '38%'}
                    innerRadius={isDesktop ? 62 : 58}
                    outerRadius={isDesktop ? 84 : 78}
                    paddingAngle={3}
                    isAnimationActive={false}
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<DonutTooltip />}
                    wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                    position={isDesktop ? { x: 215, y: 55 } : { x: 8, y: 204 }}
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                className="pointer-events-none absolute flex w-[140px] flex-col items-center text-center"
                style={{
                  left: isDesktop ? '32%' : '50%',
                  top: isDesktop ? '50%' : '38%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <p className="font-display text-3xl font-semibold text-black">
                  {score.actionableShare.toFixed(0)}%
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                  Factory
                  <br />
                  Actionable
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                  Actionable Reviews
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-black">{score.actionable}</p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                  Non-Production Reviews
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-black">{score.nonProduction}</p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                  Total Low-Star Reviews
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-black">{score.total}</p>
              </div>
              <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                  Image Evidence
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-black">
                  {score.withImagesShare.toFixed(0)}%
                </p>
                <p className="mt-1 text-xs text-[#767676]">{score.withImages} reviews with photos</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No low-star reviews in this selection"
              description="Try a broader time period, clear the date range, or choose a different product style."
            />
          </div>
        )}
      </Panel>

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Official CSV Defect Group Ranking"
          title="Most Common Quality Issues Reported by Guests"
          description="Guest reviews ranked against the official master_defect.csv defect groups, with counts, share, and evidence access in one view."
        />

        {qualityInsightCategories.some((row) => row.count > 0) ? (
          <>
            {topQualityConcerns.length ? (
              <>
              <div className="mt-6 flex items-center gap-4 rounded-[20px] border border-[#f1c7cb] bg-[#fff9fa] p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#E20010]">
                  <Target size={20} />
                </span>
                <p className="text-sm leading-6 text-[#4a4a4a]">
                  <span className="font-display font-semibold text-black">
                    Top {topQualityConcerns.length} official group{topQualityConcerns.length === 1 ? '' : 's'}
                  </span>{' '}
                  - {topQualityConcerns.map((row) => row.label).join(', ')} - account for{' '}
                  <span className="font-semibold text-black">{topQualityConcernsShare}%</span> of
                  factory-actionable quality issues.
                </p>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {topQualityConcerns.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-[20px] border border-[#e5e5e5] bg-white p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                        Rank {row.officialRank}
                      </span>
                      <span className="text-sm font-semibold text-[#E20010]">
                        {row.sharePercent}%
                      </span>
                    </div>
                    <p className="font-display mt-4 text-xl font-semibold text-black">
                      {row.label}
                    </p>
                    <p className="mt-1 text-sm text-[#767676]">
                      {row.count} review{row.count === 1 ? '' : 's'}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#4a4a4a]">
                      {row.averageSimilarity > 0
                        ? `${row.averageSimilarity}% average match confidence to this group.`
                        : 'No matched reviews in this period.'}
                    </p>
                  </div>
                ))}
              </div>
              </>
            ) : null}

            <div className="mt-6 space-y-3">
              {qualityInsightCategories.map((row) => (
                <div key={row.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <div className="sm:w-56 sm:shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a8a8a8]">
                        #{row.officialRank}
                      </span>
                      <p className="text-sm font-semibold text-black">{row.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-[#767676]">
                      {row.averageSimilarity > 0
                        ? `${row.averageSimilarity}% average match confidence`
                        : 'No matched reviews'}
                    </p>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div
                      className="h-full rounded-full bg-[#E20010]"
                      style={{ width: `${row.barWidth}%` }}
                    />
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-3 sm:w-36">
                    <span className="text-sm font-semibold text-black">
                      {row.count} review{row.count === 1 ? '' : 's'}
                    </span>
                    <span className="text-sm text-[#767676]">{row.sharePercent}%</span>
                  </div>
                </div>
              ))}
            </div>

            {qualityKeyFindings.length ? (
              <div className="mt-6 rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#767676]">
                  <Lightbulb size={14} />
                  Key Findings
                </p>
                <ul className="mt-3 space-y-2">
                  {qualityKeyFindings.map((finding) => (
                    <li key={finding} className="flex items-start gap-2 text-sm leading-6 text-[#4a4a4a]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E20010]" />
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {qualityInsightCategories.map((row) => {
                const Icon = row.icon
                return (
                  <div
                    key={row.key}
                    className="flex flex-col rounded-[20px] border border-[#e5e5e5] bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fafafa] text-black">
                        {Icon ? <Icon size={16} /> : null}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#fafafa] px-3 py-1 text-xs font-semibold text-black">
                        {row.count} reviews | {row.sharePercent}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-black">{row.label}</p>
                    <p className="mt-1 text-xs text-[#767676]">
                      Official CSV rank #{row.officialRank} | {row.imageCount} images
                    </p>

                    {row.averageSimilarity > 0 ? (
                      <p className="mt-3 text-xs leading-5 text-[#4a4a4a]">
                        <span className="font-semibold text-black">Average Match Confidence:</span>{' '}
                        {row.averageSimilarity}%
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-[#a8a8a8]">No reports in this period.</p>
                    )}

                    {row.summary ? (
                      <p className="mt-2 text-xs leading-5 text-[#4a4a4a]">
                        <span className="font-semibold text-black">CSV Group Meaning:</span> {row.summary}
                      </p>
                    ) : null}

                    {row.count > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSelectedQualityGroup(row.key)}
                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e5e5] px-4 py-2 text-xs font-semibold text-black transition hover:border-black"
                      >
                        View Evidence
                        <ArrowRight size={13} />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No reviews in this selection"
              description="Try a broader time period, clear the date range, or choose a different product style."
            />
          </div>
        )}
      </Panel>

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Master Defect Debug"
          title="CSV match audit by official defect group"
          description="Use this view to verify the dashboard is classifying reviews directly into the 6 official master_defect.csv groups via group_similarity, with no individual defect-code matching."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Ranking Count Source
            </p>
            <p className="font-display mt-2 text-2xl font-semibold text-black">
              {rankingVerification.groupedByMatchedDefectGroupOnly ? 'Verified' : 'Check Needed'}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4a4a4a]">
              {rankingVerification.finalRankingCount} ranked reviews grouped by matched_defect_group.
            </p>
          </div>
          <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Group Similarity Source
            </p>
            <p className="font-display mt-2 text-2xl font-semibold text-black">
              group_similarity
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4a4a4a]">
              {rankingVerification.averageGroupSimilarity}% average match confidence across ranked reviews.
            </p>
          </div>
          <div className="rounded-[20px] border border-[#e5e5e5] bg-[#fafafa] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Legacy Categories Used
            </p>
            <p className="font-display mt-2 text-2xl font-semibold text-black">
              {rankingVerification.legacyGroupsUsedCount}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4a4a4a]">
              {rankingVerification.legacyRawCount} raw legacy-group reviews are excluded from final ranking.
            </p>
          </div>
        </div>

        {legacyDebugRows.length ? (
          <div className="mt-5 rounded-[20px] border border-[#f5dcc0] bg-[#fff8f0] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b35900]">
              Raw legacy labels present in data, not used in final ranking
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {legacyDebugRows.map((row) => (
                <span
                  key={row.label}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4a4a4a]"
                >
                  {row.label}: {row.rawMatchedGroupCount}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {defectDebugGroups.map((group, index) => {
            const hasRows = group.reviews.length > 0

            return (
              <details
                key={group.key}
                open={index === 0}
                className="rounded-[20px] border border-[#e5e5e5] bg-white"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <span>
                    <span className="text-sm font-semibold text-black">{group.label}</span>
                    <span className="ml-3 text-xs text-[#767676]">
                      top {Math.min(group.reviews.length, 20)} of {group.count} matched reviews
                    </span>
                  </span>
                  <span className="rounded-full bg-[#fafafa] px-3 py-1 text-xs font-semibold text-black">
                    {group.sharePercent}%
                  </span>
                </summary>

                {hasRows ? (
                  <div className="overflow-x-auto border-t border-[#f0f0f0]">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[#fafafa] text-[11px] uppercase tracking-[0.16em] text-[#767676]">
                        <tr>
                          <th className="px-4 py-3">Review Title</th>
                          <th className="px-4 py-3">Matched Defect Group</th>
                          <th className="px-4 py-3">Similarity Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.reviews.map((review) => (
                          <tr key={review.key} className="border-t border-[#f0f0f0] align-top">
                            <td className="min-w-64 px-4 py-3 font-medium text-black">
                              {review.title}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-[#4a4a4a]">
                              {review.matchedDefectGroup || 'None'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-semibold text-black">
                              {formatSimilarityScore(review.similarityScore)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="border-t border-[#f0f0f0] px-5 py-4 text-sm text-[#767676]">
                    No reviews matched this official CSV group in the current selection.
                  </p>
                )}
              </details>
            )
          })}
        </div>
      </Panel>

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Operation Risk Heatmap"
          title="Risk concentration by manufacturing operation area."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heatmapRows.map((row) => {
            const Icon = row.icon
            const tone =
              row.riskLevel === 'High'
                ? 'border-[#f1c7cb] bg-[#fff1f2]'
                : row.riskLevel === 'Medium'
                  ? 'border-[#f5dcc0] bg-[#fff8f0]'
                  : 'border-[#e5e5e5] bg-white'

            return (
              <div key={row.key} className={`rounded-[20px] border p-5 ${tone}`}>
                <div className="flex items-center justify-between gap-2">
                  {Icon ? <Icon size={18} className="text-black" /> : null}
                  <RiskBadge level={row.riskLevel} compact />
                </div>
                <p className="mt-3 text-sm font-semibold text-black">{row.label}</p>
                <p className="mt-1 text-xs text-[#767676]">
                  {row.count} reviews | {row.imageCount} images
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                  {row.owner}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#4a4a4a]">{row.preventionAction}</p>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Priority Bubble Matrix"
          title="High volume and strong evidence together define the top-right priority zone."
          description="X-axis is review volume, Y-axis is evidence strength (share of reviews with photo proof), and bubble size is image count."
        />
        <div className="mt-6">
          {hasBubbles ? (
            <div className="h-[380px]" role="img" aria-label="Priority bubble matrix">
              <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 10 }}>
                  <CartesianGrid stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Review Volume"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#767676', fontSize: 12 }}
                    label={{
                      value: 'Review Volume',
                      position: 'insideBottom',
                      offset: -8,
                      fill: '#767676',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Evidence Strength"
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#767676', fontSize: 12 }}
                    label={{
                      value: 'Evidence Strength',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#767676',
                      fontSize: 12,
                    }}
                  />
                  <ZAxis type="number" dataKey="z" range={[140, 900]} name="Image Count" />
                  <ReferenceLine x={bubbleMedianX} stroke="#d9d9d9" strokeDasharray="4 4" />
                  <ReferenceLine y={bubbleMedianY} stroke="#d9d9d9" strokeDasharray="4 4" />
                  <Tooltip content={<BubbleTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={bubbleData} isAnimationActive={false}>
                    {bubbleData.map((entry) => (
                      <Cell key={entry.key} fill={riskFill(entry.riskLevel)} fillOpacity={0.78} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No bubble matrix data"
              description="Try a broader time period, clear the date range, or choose a different product style."
            />
          )}
        </div>
      </Panel>

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Owner Action Board"
          title="Every production risk routed to the team that owns the fix."
          description="Ranked by review volume — the top card is the most urgent fix for that owner."
        />
        {ownerBoardRows.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ownerBoardRows.map((row) => {
              const Icon = row.icon
              return (
                <div
                  key={row.key}
                  className="flex flex-col rounded-[20px] border border-[#e5e5e5] bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fafafa] text-black">
                      {Icon ? <Icon size={16} /> : null}
                    </span>
                    <RiskBadge level={row.riskLevel} compact />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-black">{row.actionIssueLabel}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676]">
                    {row.owner}
                  </p>
                  <p className="mt-1 text-xs text-[#767676]">
                    {row.count} reviews | {row.imageCount} images
                  </p>
                  {row.qaChecklist.length ? (
                    <ul className="mt-3 space-y-1">
                      {row.qaChecklist.slice(0, 3).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-[#4a4a4a]">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E20010]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-3 text-xs leading-5 text-[#4a4a4a]">
                    {truncateText(row.preventionAction, 90)}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No owner actions available"
              description="Try a broader time period, clear the date range, or choose a different product style."
            />
          </div>
        )}
      </Panel>

      <Panel id="evidence-wall" className="p-7 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            eyebrow="Evidence Wall"
            title="Factory-actionable evidence, image-backed reviews first."
          />
          <button
            type="button"
            onClick={() => setShowNonProduction((value) => !value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
              showNonProduction
                ? 'border-black bg-black text-white'
                : 'border-[#e5e5e5] bg-white text-[#4a4a4a] hover:border-black'
            }`}
          >
            {showNonProduction ? 'Hide non-production' : 'Show non-production'}
          </button>
        </div>
        {evidenceWallItems.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {evidenceWallItems.map((item) => (
              <div key={item.key} className="overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-white">
                <div className="flex aspect-square items-center justify-center bg-[#f5f5f5]">
                  {item.imageUrl ? (
                    <button
                      type="button"
                      onClick={() => setLightboxImage({ url: item.imageUrl, alt: item.category })}
                      className="h-full w-full cursor-zoom-in"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.category}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ) : (
                    <Camera size={28} className="text-[#a8a8a8]" />
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingBadge rating={item.rating} compact />
                    <PriorityPill priority={item.priority} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#767676]">
                    {item.category}
                  </p>
                  <p className="line-clamp-3 text-sm leading-6 text-[#4a4a4a]">
                    {truncateText(item.reviewText, 110)}
                  </p>
                  <p className="text-xs text-[#767676]">{item.operationArea}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No production-actionable evidence found"
              description="Try a broader time period, clear the date range, or choose a different product style."
            />
          </div>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="p-7 sm:p-8">
          <SectionHeader
            eyebrow="Detailed Production Mapping"
            title="Full category-to-operation reference table."
            description="Use the visuals above for decisions — this table is the appendix-level reference."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-white text-[11px] uppercase tracking-[0.18em] text-[#767676]">
              <tr>
                <th className="px-5 py-4">Production Category</th>
                <th className="px-5 py-4">Guest Signal Examples</th>
                <th className="px-5 py-4">Review Count</th>
                <th className="px-5 py-4">Image Evidence</th>
                <th className="px-5 py-4">Risk Level</th>
                <th className="px-5 py-4">Operation Area</th>
                <th className="px-5 py-4">Owner</th>
                <th className="px-5 py-4">Recommended Prevention Action</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => {
                const Icon = row.icon
                return (
                  <tr
                    key={row.key}
                    className={`border-t border-[#f0f0f0] align-top ${
                      row.isProduction ? 'bg-white' : 'bg-[#fafafa] text-[#a8a8a8]'
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-[#000000]">
                      <span className="flex items-center gap-2">
                        {Icon ? (
                          <Icon size={15} className={row.isProduction ? 'text-black' : 'text-[#a8a8a8]'} />
                        ) : null}
                        {row.label}
                      </span>
                    </td>
                    <td className="min-w-56 px-5 py-4 text-sm text-[#4a4a4a]">{row.signalExamples}</td>
                    <td className="px-5 py-4 text-[#4a4a4a]">{row.count}</td>
                    <td className="px-5 py-4 text-[#4a4a4a]">{row.imageCount}</td>
                    <td className="px-5 py-4">
                      <RiskBadge level={row.riskLevel} />
                    </td>
                    <td className="min-w-56 px-5 py-4 text-sm text-[#4a4a4a]">{row.operationArea}</td>
                    <td className="min-w-44 px-5 py-4 text-sm text-[#4a4a4a]">{row.owner}</td>
                    <td className="min-w-64 px-5 py-4 text-sm text-[#4a4a4a]">{row.preventionAction}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

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

      <QualityEvidenceDrawer
        category={evidenceDrawerCategory}
        reviews={evidenceDrawerReviews}
        onClose={() => setSelectedQualityGroup(null)}
        onImageClick={setLightboxImage}
      />

      <ImageLightbox
        imageUrl={lightboxImage?.url}
        alt={lightboxImage?.alt}
        isOpen={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  )
}
