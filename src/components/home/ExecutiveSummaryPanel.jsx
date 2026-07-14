import {
  Camera,
  Factory,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import Panel from '../primitives/Panel'
import { TIME_PERIOD_OPTIONS } from '../../data/constants'
import {
  buildResponseMetrics,
  calculateFactoryActionabilityScore,
  formatShortDate,
  getTopComplaintTheme,
  isWithinDateWindow,
  shiftDateByMonths,
} from '../../data/selectors'

export const SUMMARY_PERIOD_OPTIONS = [...TIME_PERIOD_OPTIONS].sort((left, right) => left.months - right.months)

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function formatPercent(value) {
  return `${Math.round(value || 0)}%`
}

function getAverageRating(reviews) {
  if (!reviews.length) {
    return null
  }

  const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0)
  return sum / reviews.length
}

export default function ExecutiveSummaryPanel({ data, periodValue, onPeriodChange }) {
  const selectedOption =
    SUMMARY_PERIOD_OPTIONS.find((option) => option.value === periodValue) || SUMMARY_PERIOD_OPTIONS[0]

  const windowEnd = new Date()
  const windowStart = shiftDateByMonths(windowEnd, -selectedOption.months)
  const previousWindowEnd = windowStart
  const previousWindowStart = shiftDateByMonths(windowStart, -selectedOption.months)
  const periodNoun = selectedOption.months === 1 ? '30-day' : `${selectedOption.months}-month`

  const currentWindowReviews = data.masterReviews.filter((review) =>
    isWithinDateWindow(review.reviewDate, windowStart, windowEnd),
  )
  const previousWindowReviews = data.masterReviews.filter((review) =>
    isWithinDateWindow(review.reviewDate, previousWindowStart, previousWindowEnd),
  )
  const currentWindowImages = data.imageItems.filter((item) =>
    isWithinDateWindow(item.reviewDate, windowStart, windowEnd),
  )

  const topTheme = getTopComplaintTheme(currentWindowReviews)
  const responseMetrics = buildResponseMetrics(currentWindowReviews)
  const averageRating = getAverageRating(currentWindowReviews)
  const actionability = calculateFactoryActionabilityScore(currentWindowReviews)

  const delta = currentWindowReviews.length - previousWindowReviews.length
  const deltaPercent = previousWindowReviews.length
    ? (delta / previousWindowReviews.length) * 100
    : 0
  const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'stable'

  const trendTone = direction === 'increased' ? 'negative' : direction === 'decreased' ? 'positive' : 'neutral'
  const TrendIcon = direction === 'increased' ? TrendingUp : direction === 'decreased' ? TrendingDown : Gauge
  const trendColorClass =
    trendTone === 'positive' ? 'text-[#4ade80]' : trendTone === 'negative' ? 'text-[#ff6b6b]' : 'text-white/60'

  const rangeLabel = `${formatShortDate(windowStart)} - ${formatShortDate(windowEnd)}`

  const stats = [
    {
      label: 'Avg rating',
      value: averageRating ? averageRating.toFixed(2) : 'N/A',
      icon: Gauge,
    },
    {
      label: 'Factory actionable',
      value: formatPercent(actionability.actionableShare),
      icon: Factory,
    },
    {
      label: 'Photo evidence',
      value: formatNumber(currentWindowImages.length),
      icon: Camera,
    },
    {
      label: 'Brand response rate',
      value: formatPercent(responseMetrics.responseRate),
      icon: ShieldCheck,
    },
  ]

  return (
    <Panel className="overflow-hidden rounded-[8px] !border-[#1a1a1a] !bg-black p-0 text-white">
      <div className="p-5 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Executive Summary
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold leading-[1.05] tracking-normal text-white sm:text-3xl">
              {rangeLabel}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Trailing {periodNoun === '30-day' ? '30 days' : periodNoun.replace('-', ' ')} of guest sentiment
              activity, {data.selectedProductName}.
            </p>
          </div>

          <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            {SUMMARY_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onPeriodChange(option.value)}
                className={`min-w-10 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  option.value === periodValue
                    ? 'bg-[#E20010] text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Low-star reviews
            </p>
            <p className="font-display mt-2 text-6xl font-semibold leading-none text-white sm:text-7xl">
              {formatNumber(currentWindowReviews.length)}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <TrendIcon size={16} className={trendColorClass} />
              <p className={`text-sm font-semibold ${trendColorClass}`}>
                {previousWindowReviews.length
                  ? `${direction === 'stable' ? 'Steady' : `${Math.abs(Math.round(deltaPercent))}% ${direction}`} vs prior ${periodNoun} period`
                  : `No prior ${periodNoun} period to compare`}
              </p>
            </div>
            <p className="mt-1 text-xs text-white/40">
              {formatNumber(currentWindowReviews.length)} vs {formatNumber(previousWindowReviews.length)} reviews (
              {formatShortDate(previousWindowStart)} - {formatShortDate(previousWindowEnd)}).
            </p>
          </div>

          <div className="flex flex-col justify-between gap-4">
            {topTheme ? (
              <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#E20010]/40 bg-[#E20010]/10 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E20010]">
                  <ShieldAlert size={16} />
                </span>
                <p className="text-sm leading-6 text-white/90">
                  <span className="font-semibold text-white">Top risk: {topTheme.theme}</span> &mdash;{' '}
                  {topTheme.share.toFixed(1)}% of this period&apos;s low-star volume
                  {actionability.highestRiskCategory
                    ? `, led by ${actionability.highestRiskCategory} defects`
                    : ''}
                  .
                </p>
              </div>
            ) : (
              <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-sm text-white/70">
                  No single complaint theme dominated this period&apos;s low-star volume.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3.5"
                  >
                    <div className="flex items-center gap-2 text-white/50">
                      <Icon size={14} />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">{stat.label}</p>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm leading-7 text-white/60">
          {formatNumber(currentWindowImages.length)} reviews included photo evidence, and the brand responded to{' '}
          {formatPercent(responseMetrics.responseRate)} of this period&apos;s low-star reviews.
        </p>
      </div>
    </Panel>
  )
}
