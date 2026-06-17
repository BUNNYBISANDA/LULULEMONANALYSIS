import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  ClipboardCheck,
  Factory,
  Filter,
  MessageSquareQuote,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Workflow,
  TrendingUp,
} from 'lucide-react'
import RiskBadge from '../components/primitives/RiskBadge'
import { LOGO_PATH } from '../data/constants'
import {
  buildProductionDefectMatrix,
  calculateFactoryActionabilityScore,
} from '../data/selectors'
import { useDashboardDataset } from '../hooks/useDataset'

const flowSteps = [
  {
    label: 'Reviews',
    sentence: 'Guest feedback enters one view.',
    icon: MessageSquareQuote,
  },
  {
    label: 'Low-Star Signals',
    sentence: '1-3 star reviews surface risk.',
    icon: Filter,
  },
  {
    label: 'Defect Detection',
    sentence: 'Repeat themes are grouped.',
    icon: Search,
  },
  {
    label: 'Image Evidence',
    sentence: 'Photos show visible proof.',
    icon: Camera,
  },
  {
    label: 'Operation Mapping',
    sentence: 'Issues route to factory areas.',
    icon: Workflow,
  },
  {
    label: 'Quality Action',
    sentence: 'Teams prioritize prevention.',
    icon: ClipboardCheck,
  },
]

const actionAreaLabels = {
  sewing_construction: 'Sewing Construction',
  zipper_trim: 'Zipper / Trim',
  fabric_surface: 'Fabric Surface',
  color_wash: 'Color / Wash',
  measurement_fit: 'Measurement / Fit',
  finishing_appearance: 'Finishing',
}

const evidenceTiles = [
  {
    label: 'Review Text',
    value: (data) => `${data?.masterReviews.length ?? 0} comments`,
    icon: MessageSquareQuote,
  },
  {
    label: 'Star Rating',
    value: (data) => (data?.averageRating ? `${data.averageRating} avg` : '0 avg'),
    icon: Star,
  },
  {
    label: 'Customer Images',
    value: (data) => `${data?.imageItems.length ?? 0} images`,
    icon: Camera,
  },
  {
    label: 'Trend Frequency',
    value: (data) => `${data?.monthlyTrend.length ?? 0} months`,
    icon: TrendingUp,
  },
]

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function MetricCard({ label, value, note, icon: Icon, featured = false }) {
  return (
    <div
      className={`group min-h-[172px] rounded-[8px] border bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.045)] transition duration-300 hover:-translate-y-1 ${
        featured ? 'border-[#f1c7cb]' : 'border-[#e5e5e5]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            featured ? 'bg-[#E20010] text-white' : 'bg-[#f5f2ef] text-black'
          }`}
        >
          <Icon size={20} />
        </span>
        <span className="h-0.5 w-8 bg-[#E20010]" />
      </div>
      <p className="font-display mt-6 text-4xl font-semibold leading-none text-black sm:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
        {label}
      </p>
      {note ? <p className="mt-2 text-sm text-[#4a4a4a]">{note}</p> : null}
    </div>
  )
}

function FlowCard({ step, index }) {
  const Icon = step.icon

  return (
    <div className="relative flex min-h-[172px] flex-col justify-between rounded-[8px] border border-[#e5e5e5] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f2ef] text-black">
          <Icon size={19} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a8a8a8]">
          0{index + 1}
        </span>
      </div>
      <div>
        <h3 className="mt-6 text-base font-semibold text-black">{step.label}</h3>
        <p className="mt-2 text-sm leading-6 text-[#4a4a4a]">{step.sentence}</p>
      </div>
    </div>
  )
}

function BeforeAfterCard({ tone, title, text, icon: Icon, items }) {
  const isAfter = tone === 'after'

  return (
    <div
      className={`rounded-[8px] border p-6 sm:p-7 ${
        isAfter ? 'border-[#f1c7cb] bg-[#fff9fa]' : 'border-[#e5e5e5] bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isAfter ? 'bg-[#E20010] text-white' : 'bg-[#f5f2ef] text-black'
          }`}
        >
          <Icon size={21} />
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            isAfter ? 'bg-white text-[#E20010]' : 'bg-[#f5f5f5] text-[#767676]'
          }`}
        >
          {title}
        </span>
      </div>
      <p className="font-display mt-6 text-2xl font-semibold leading-tight text-black sm:text-3xl">
        {text}
      </p>
      <div className="mt-6 grid gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm font-medium text-[#4a4a4a]">
            <span className={`h-0.5 w-5 shrink-0 ${isAfter ? 'bg-[#E20010]' : 'bg-[#a8a8a8]'}`} />
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionAreaCard({ area }) {
  const Icon = area.icon || Factory

  return (
    <div className="rounded-[8px] border border-[#e5e5e5] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f2ef] text-black">
          <Icon size={19} />
        </span>
        <RiskBadge level={area.riskLevel} compact />
      </div>
      <h3 className="mt-5 text-lg font-semibold leading-tight text-black">{area.displayLabel}</h3>
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
        <p className="font-display text-4xl font-semibold leading-none text-black">
          {formatNumber(area.count)}
        </p>
        <div className="self-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#767676]">
            Issues
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-[#4a4a4a]">{area.owner}</p>
        </div>
      </div>
    </div>
  )
}

function EvidenceTile({ tile, data }) {
  const Icon = tile.icon

  return (
    <div className="rounded-[8px] border border-[#e5e5e5] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f2ef] text-black">
          <Icon size={18} />
        </span>
        <ShieldCheck size={18} className="text-[#E20010]" />
      </div>
      <p className="mt-5 text-sm font-semibold text-black">{tile.label}</p>
      <p className="font-display mt-2 text-2xl font-semibold text-black">{tile.value(data)}</p>
    </div>
  )
}

export default function VPVisionPage() {
  const { data } = useDashboardDataset(true)

  const factoryScore = useMemo(
    () => calculateFactoryActionabilityScore(data?.masterReviews || []),
    [data],
  )

  const actionAreas = useMemo(
    () =>
      buildProductionDefectMatrix(data?.masterReviews || [])
        .filter((row) => Object.keys(actionAreaLabels).includes(row.key))
        .map((row) => ({
          ...row,
          displayLabel: actionAreaLabels[row.key],
        })),
    [data],
  )

  const metrics = [
    {
      label: 'Reviews analyzed',
      value: formatNumber(data?.masterReviews.length || 0),
      note: data?.periodRangeLabel || 'Current VOG window',
      icon: MessageSquareQuote,
      featured: true,
    },
    {
      label: 'Images mapped',
      value: formatNumber(data?.imageItems.length || 0),
      note: 'Customer photo evidence',
      icon: Camera,
    },
    {
      label: 'Factory-actionable issues',
      value: formatNumber(factoryScore.actionable),
      note: `${factoryScore.actionableShare.toFixed(0)}% routed to production`,
      icon: Factory,
    },
  ]

  return (
    <div className="space-y-16 bg-[#fbfaf8] px-1 pb-8 pt-2 text-black sm:px-2 lg:px-4">
      <section className="relative overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-[#f7f3ef] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="absolute right-0 top-0 hidden h-full w-[34%] border-l border-[#e5e5e5] bg-white/45 lg:block" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <img
                  src={LOGO_PATH}
                  alt="lululemon logo"
                  className="h-11 w-11 rounded-full object-contain"
                />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#767676]">
                Guest-to-Factory Intelligence
              </span>
            </div>
            <h1 className="font-display mt-8 max-w-4xl text-5xl font-semibold leading-[0.95] text-black sm:text-6xl lg:text-7xl">
              {'Guest Feedback \u2192 Factory Action'}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#3f3a37] sm:text-xl">
              Turning real customer reviews, ratings, and images into clear quality
              improvement priorities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#767676]">
              Visual Flow
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl">
              From signal to action in six moves.
            </h2>
          </div>
          <span className="rounded-full border border-[#f1c7cb] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E20010]">
            Evidence trail stays visible
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="relative">
              <FlowCard step={step} index={index} />
              {index < flowSteps.length - 1 ? (
                <div className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#E20010] xl:flex">
                  <ArrowRight size={16} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <BeforeAfterCard
          tone="before"
          title="Before"
          text="Guest complaints stay as scattered text."
          icon={MessageSquareQuote}
          items={['Review comments', 'Photo uploads', 'Rating drops']}
        />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white lg:h-14 lg:w-14">
          <ArrowRight size={22} />
        </div>
        <BeforeAfterCard
          tone="after"
          title="After"
          text="Complaints become categorized production actions."
          icon={Factory}
          items={['Issue category', 'Factory area', 'Owner priority']}
        />
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#767676]">
              Factory Action Areas
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl">
              Six places where guest feedback becomes prevention.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#4a4a4a]">
            <ShieldCheck size={17} className="text-[#E20010]" />
            Risk, count, owner
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {actionAreas.map((area) => (
            <ActionAreaCard key={area.key} area={area} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#767676]">
              Evidence-Based Decisions
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl">
              Clear priorities, backed by proof.
            </h2>
          </div>
          <Tag size={22} className="text-[#E20010]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {evidenceTiles.map((tile) => (
            <EvidenceTile key={tile.label} tile={tile} data={data} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[8px] bg-black px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-10">
        <div className="absolute right-0 top-0 h-full w-2 bg-[#E20010]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 text-[#f5f2ef]">
              <ShieldCheck size={20} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                Customer Presentation
              </span>
            </div>
            <h2 className="font-display mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              From Voice of Guest to Preventive Quality Action
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#e7e0da]">
              This system helps teams identify repeat issues earlier, prioritize factory
              action, and prevent the same defects from reaching future guests.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              to="/vp-vision/analytics"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#E20010] hover:text-white"
            >
              View Production Analytics
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              View Evidence Gallery
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
