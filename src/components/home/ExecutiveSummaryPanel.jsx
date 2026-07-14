import {
  CalendarRange,
  Camera,
  Gauge,
  MessageSquareQuote,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import Panel from '../primitives/Panel'
import SectionHeader from '../primitives/SectionHeader'
import { buildResponseMetrics, getTopComplaintTheme } from '../../data/selectors'

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function formatPercent(value) {
  return `${Math.round(value || 0)}%`
}

export default function ExecutiveSummaryPanel({ data, volumeTrend }) {
  const currentMonth = data.monthlyTrend?.at(-1)

  if (!currentMonth) {
    return null
  }

  const previousMonth = data.monthlyTrend.at(-2)

  const currentMonthReviews = data.masterReviews.filter(
    (review) => review.monthKey === currentMonth.monthKey,
  )
  const currentMonthImages = data.imageItems.filter(
    (item) => String(item.reviewDate || '').slice(0, 7) === currentMonth.monthKey,
  )
  const topTheme = getTopComplaintTheme(currentMonthReviews)
  const responseMetrics = buildResponseMetrics(currentMonthReviews)

  const trendTone =
    volumeTrend.direction === 'increased'
      ? 'negative'
      : volumeTrend.direction === 'decreased'
        ? 'positive'
        : 'neutral'
  const TrendIcon =
    volumeTrend.direction === 'increased'
      ? TrendingUp
      : volumeTrend.direction === 'decreased'
        ? TrendingDown
        : Gauge

  const narrative = [
    `In ${currentMonth.label}, we logged ${formatNumber(currentMonthReviews.length)} low-star reviews averaging ${
      currentMonth.averageRating ? currentMonth.averageRating.toFixed(2) : 'N/A'
    } stars.`,
    topTheme
      ? `${topTheme.theme} was the leading complaint theme, accounting for ${topTheme.share.toFixed(1)}% of this month's low-star volume.`
      : "No single complaint theme dominated this month's low-star volume.",
    previousMonth
      ? `Volume ${volumeTrend.direction === 'stable' ? 'held steady' : volumeTrend.direction}${
          volumeTrend.deltaPercent ? ` by ${Math.abs(Math.round(volumeTrend.deltaPercent))}%` : ''
        } versus ${previousMonth.label}.`
      : 'This is the earliest month in the selected window, so no prior-month comparison is available yet.',
    `${formatNumber(currentMonthImages.length)} reviews included photo evidence, and the brand responded to ${formatPercent(
      responseMetrics.responseRate,
    )} of this month's low-star reviews.`,
  ].join(' ')

  const stats = [
    {
      label: 'Reviews this month',
      value: formatNumber(currentMonthReviews.length),
      icon: MessageSquareQuote,
    },
    {
      label: 'Avg rating',
      value: currentMonth.averageRating ? currentMonth.averageRating.toFixed(2) : 'N/A',
      icon: Gauge,
    },
    {
      label: 'Photo evidence',
      value: formatNumber(currentMonthImages.length),
      icon: Camera,
    },
    {
      label: 'Brand response rate',
      value: formatPercent(responseMetrics.responseRate),
      icon: ShieldCheck,
    },
  ]

  return (
    <Panel className="p-5 sm:p-6">
      <SectionHeader
        eyebrow="Executive Summary"
        title={`${currentMonth.label} at a glance`}
        description="A one-look recap of guest sentiment activity for the most recent month in the selected window, generated from this month's low-star review evidence."
        titlePrefix={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-black">
            <CalendarRange size={18} />
          </span>
        }
      />

      <p className="mt-5 text-sm leading-7 text-[#4a4a4a]">{narrative}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-[8px] border border-[#e5e5e5] bg-[#fafafa] p-4">
              <div className="flex items-center gap-2 text-[#767676]">
                <Icon size={15} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{stat.label}</p>
              </div>
              <p className="mt-2 text-xl font-semibold text-black">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-[8px] border border-[#e5e5e5] bg-white p-4">
        <TrendIcon
          size={18}
          className={
            trendTone === 'positive'
              ? 'text-[#1f6f3e]'
              : trendTone === 'negative'
                ? 'text-[#E20010]'
                : 'text-[#767676]'
          }
        />
        <p className="text-sm text-[#4a4a4a]">
          {previousMonth
            ? `Month-over-month: ${formatNumber(currentMonthReviews.length)} vs ${formatNumber(previousMonth.total)} reviews in ${previousMonth.label}.`
            : 'No prior month in the selected window to compare against.'}
        </p>
      </div>
    </Panel>
  )
}
