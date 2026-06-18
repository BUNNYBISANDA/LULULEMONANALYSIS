import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
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

const premiumEase = [0.22, 1, 0.36, 1]
const viewportOnce = { once: true, amount: 0.28, margin: '0px 0px -80px 0px' }

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function revealVariant({ shouldReduceMotion, x = 0, y = 18, delay = 0 } = {}) {
  return {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : x,
      y: shouldReduceMotion ? 0 : y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        ease: premiumEase,
        delay: shouldReduceMotion ? 0 : delay,
      },
    },
  }
}

function CountUpNumber({ value }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.65 })
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isInView || shouldReduceMotion) {
      return undefined
    }

    const controls = animate(0, value || 0, {
      duration: 1.1,
      ease: premiumEase,
      onUpdate: (latest) => setDisplayValue(latest),
    })

    return () => controls.stop()
  }, [isInView, shouldReduceMotion, value])

  return (
    <p
      ref={ref}
      className="font-display mt-5 break-words text-3xl font-semibold leading-none text-black sm:mt-6 sm:text-4xl lg:text-5xl"
    >
      {formatNumber(Math.round(shouldReduceMotion ? value || 0 : displayValue))}
    </p>
  )
}

function MetricCard({ label, value, note, icon: Icon, featured = false, index = 0 }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={revealVariant({ shouldReduceMotion, x: 24, y: 8, delay: index * 0.09 })}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className={`group min-h-[150px] min-w-0 overflow-hidden rounded-[8px] border bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.045)] transition-shadow duration-300 sm:min-h-[172px] sm:p-5 ${
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
      <CountUpNumber value={value} />
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.18em]">
        {label}
      </p>
      {note ? <p className="mt-2 text-sm text-[#4a4a4a]">{note}</p> : null}
    </motion.div>
  )
}

function FlowCard({ step, index }) {
  const Icon = step.icon
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={revealVariant({ shouldReduceMotion, y: 18, delay: index * 0.08 })}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="relative flex min-h-[150px] min-w-0 flex-col justify-between overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:min-h-[172px] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f2ef] text-black">
          <Icon size={19} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a8a8a8] sm:tracking-[0.18em]">
          0{index + 1}
        </span>
      </div>
      <div>
        <h3 className="mt-6 text-base font-semibold text-black">{step.label}</h3>
        <p className="mt-2 text-sm leading-6 text-[#4a4a4a]">{step.sentence}</p>
      </div>
    </motion.div>
  )
}

function BeforeAfterCard({ tone, title, text, icon: Icon, items }) {
  const isAfter = tone === 'after'
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={revealVariant({ shouldReduceMotion, x: isAfter ? 28 : -28, y: 0 })}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={`min-w-0 overflow-hidden rounded-[8px] border p-4 sm:p-6 lg:p-7 ${
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
      <p className="font-display mt-5 text-xl font-semibold leading-tight text-black sm:mt-6 sm:text-2xl md:text-3xl">
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
    </motion.div>
  )
}

function ActionAreaCard({ area, index = 0 }) {
  const Icon = area.icon || Factory
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={revealVariant({ shouldReduceMotion, y: 18, delay: index * 0.06 })}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      whileHover={shouldReduceMotion ? undefined : { y: -5 }}
      className="min-w-0 overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.035)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f2ef] text-black">
          <Icon size={19} />
        </span>
        <RiskBadge level={area.riskLevel} compact />
      </div>
      <h3 className="mt-5 text-base font-semibold leading-tight text-black sm:text-lg">{area.displayLabel}</h3>
      <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3">
        <p className="font-display text-3xl font-semibold leading-none text-black sm:text-4xl">
          {formatNumber(area.count)}
        </p>
        <div className="self-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#767676]">
            Issues
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-[#4a4a4a]">{area.owner}</p>
        </div>
      </div>
    </motion.div>
  )
}

function EvidenceTile({ tile, data, index = 0 }) {
  const Icon = tile.icon
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={revealVariant({ shouldReduceMotion, y: 16, delay: index * 0.07 })}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="min-w-0 overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <motion.span
          whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.25, ease: premiumEase }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f2ef] text-black"
        >
          <Icon size={18} />
        </motion.span>
        <ShieldCheck size={18} className="text-[#E20010]" />
      </div>
      <p className="mt-5 text-sm font-semibold text-black">{tile.label}</p>
      <p className="font-display mt-2 text-2xl font-semibold text-black">{tile.value(data)}</p>
    </motion.div>
  )
}

export default function VPVisionPage() {
  const { data } = useDashboardDataset(true)
  const shouldReduceMotion = useReducedMotion()

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
      value: data?.masterReviews.length || 0,
      note: data?.periodRangeLabel || 'Current VOG window',
      icon: MessageSquareQuote,
      featured: true,
    },
    {
      label: 'Images mapped',
      value: data?.imageItems.length || 0,
      note: 'Customer photo evidence',
      icon: Camera,
    },
    {
      label: 'Factory-actionable issues',
      value: factoryScore.actionable,
      note: `${factoryScore.actionableShare.toFixed(0)}% routed to production`,
      icon: Factory,
    },
  ]

  return (
    <div className="bg-[#fbfaf8] pb-8 pt-2 text-black">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 sm:gap-14 sm:px-6 lg:gap-16 lg:px-8 xl:px-10">
      <motion.section
        variants={revealVariant({ shouldReduceMotion, y: 20 })}
        initial="hidden"
        animate="visible"
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-[#f7f3ef] px-4 py-8 sm:px-6 md:px-8 lg:px-10 lg:py-12 xl:px-12"
      >
        <div className="absolute right-0 top-0 hidden h-full w-[34%] border-l border-[#e5e5e5] bg-white/45 lg:block" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-end">
          <div>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <img
                  src={LOGO_PATH}
                  alt="lululemon logo"
                  className="h-11 w-11 rounded-full object-contain"
                />
              </span>
              <span className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.2em]">
                Guest-to-Factory Intelligence
              </span>
            </div>
            <h1 className="font-display mt-7 max-w-4xl break-words text-4xl font-semibold leading-tight text-black sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[0.95]">
              {'Guest Feedback \u2192 Factory Action'}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#3f3a37] sm:text-lg md:text-xl md:leading-8">
              Turning real customer reviews, ratings, and images into clear quality
              improvement priorities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:min-w-0">
            {metrics.map((metric, index) => (
              <MetricCard key={metric.label} {...metric} index={index} />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={revealVariant({ shouldReduceMotion, y: 14 })}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto w-full max-w-7xl overflow-hidden"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.2em]">
              Visual Flow
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-normal text-black sm:text-3xl md:text-4xl">
              From signal to action in six moves.
            </h2>
          </div>
          <span className="w-fit rounded-full border border-[#f1c7cb] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#E20010] sm:tracking-[0.16em]">
            Evidence trail stays visible
          </span>
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 2xl:gap-5">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="relative min-w-0">
              <FlowCard step={step} index={index} />
              {index < flowSteps.length - 1 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={viewportOnce}
                  animate={shouldReduceMotion ? undefined : { x: [0, 5, 0] }}
                  transition={{
                    opacity: {
                      duration: shouldReduceMotion ? 0 : 0.45,
                      delay: shouldReduceMotion ? 0 : index * 0.08 + 0.2,
                    },
                    x: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#E20010] xl:flex"
                >
                  <ArrowRight size={16} />
                </motion.div>
              ) : null}
            </div>
          ))}
        </div>
      </motion.section>

      <section className="mx-auto grid w-full max-w-7xl min-w-0 gap-5 overflow-hidden lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-6">
        <BeforeAfterCard
          tone="before"
          title="Before"
          text="Guest complaints stay as scattered text."
          icon={MessageSquareQuote}
          items={['Review comments', 'Photo uploads', 'Rating drops']}
        />
        <motion.div
          variants={revealVariant({ shouldReduceMotion, y: 0, delay: 0.18 })}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-black text-white lg:h-14 lg:w-14 lg:rotate-0"
        >
          <ArrowRight size={22} />
        </motion.div>
        <BeforeAfterCard
          tone="after"
          title="After"
          text="Complaints become categorized production actions."
          icon={Factory}
          items={['Issue category', 'Factory area', 'Owner priority']}
        />
      </section>

      <motion.section
        variants={revealVariant({ shouldReduceMotion, y: 14 })}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto w-full max-w-7xl overflow-hidden"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.2em]">
              Factory Action Areas
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-normal text-black sm:text-3xl md:text-4xl">
              Six places where guest feedback becomes prevention.
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#4a4a4a]">
            <ShieldCheck size={17} className="text-[#E20010]" />
            Risk, count, owner
          </div>
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
          {actionAreas.map((area, index) => (
            <ActionAreaCard key={area.key} area={area} index={index} />
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={revealVariant({ shouldReduceMotion, y: 14 })}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto w-full max-w-7xl overflow-hidden"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.2em]">
              Evidence-Based Decisions
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-normal text-black sm:text-3xl md:text-4xl">
              Clear priorities, backed by proof.
            </h2>
          </div>
          <Tag size={22} className="text-[#E20010]" />
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {evidenceTiles.map((tile, index) => (
            <EvidenceTile key={tile.label} tile={tile} data={data} index={index} />
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={revealVariant({ shouldReduceMotion, y: 18 })}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[8px] bg-black px-4 py-8 text-white sm:px-6 md:px-8 lg:px-10 lg:py-12 xl:px-12"
      >
        <motion.div
          initial={{ scaleY: shouldReduceMotion ? 1 : 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={viewportOnce}
          transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: premiumEase }}
          style={{ transformOrigin: 'top' }}
          className="absolute right-0 top-0 h-full w-2 bg-[#E20010]"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 text-[#f5f2ef]">
              <ShieldCheck size={20} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.2em]">
                Customer Presentation
              </span>
            </div>
            <h2 className="font-display mt-5 text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              From Voice of Guest to Preventive Quality Action
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#e7e0da]">
              This system helps teams identify repeat issues earlier, prioritize factory
              action, and prevent the same defects from reaching future guests.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} className="w-full sm:w-auto">
              <Link
                to="/vp-vision/analytics"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E20010] hover:text-white sm:w-auto sm:px-6"
              >
                View Production Analytics
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} className="w-full sm:w-auto">
              <Link
                to="/gallery"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 sm:w-auto sm:px-6"
              >
                View Evidence Gallery
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
      </div>
    </div>
  )
}
