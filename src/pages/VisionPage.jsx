import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Camera,
  ClipboardCheck,
  Eye,
  Layers3,
  ListChecks,
  MessageSquareQuote,
  Radar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Panel from '../components/primitives/Panel'
import SectionHeader from '../components/primitives/SectionHeader'
import { LOGO_PATH } from '../data/constants'

const visionCards = [
  {
    title: 'Listen',
    text: 'Capture guest reviews, ratings, low-star comments, and customer-submitted evidence.',
    icon: MessageSquareQuote,
  },
  {
    title: 'Detect',
    text: 'Identify repeated complaint themes, emerging fit issues, material concerns, and service friction.',
    icon: Radar,
  },
  {
    title: 'Prioritize',
    text: 'Help product, quality, and guest experience teams focus on the highest-impact issues first.',
    icon: ListChecks,
  },
]

const pipelineSteps = [
  { label: 'Guest Reviews', icon: MessageSquareQuote },
  { label: 'Low-Star Detection', icon: Eye },
  { label: 'Theme Classification', icon: Layers3 },
  { label: 'Image Evidence', icon: Camera },
  { label: 'Quality Decision Support', icon: ClipboardCheck },
]

const currentPhase = [
  'Guest reviews',
  'Low-star signals',
  'Complaint themes',
  'Image-backed evidence',
  'Product risk signals',
]

const futurePhase = [
  'Production and inspection data',
  'Factory quality signals',
  'Internal defect trends',
  'Root-cause comparison',
  'Quality improvement validation',
]

function PhaseList({ title, eyebrow, items, icon: Icon }) {
  return (
    <Panel className="p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
            {eyebrow}
          </p>
          <h3 className="font-display mt-2 text-2xl font-semibold text-black">{title}</h3>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-[#4a4a4a]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E20010]" />
            {item}
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export default function VisionPage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-[#e5e5e5] bg-[#fafafa] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <img
                  src={LOGO_PATH}
                  alt="lululemon logo"
                  className="h-10 w-10 rounded-full object-contain"
                />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#767676]">
                Quality Signal Platform
              </span>
            </div>
            <h1 className="font-display mt-7 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-black sm:text-6xl lg:text-7xl">
              Voice of Guest Intelligence
            </h1>
            <p className="mt-5 text-xl font-semibold text-black">
              Turning guest feedback into product quality signals.
            </p>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#4a4a4a]">
              This platform converts public guest reviews, low-star feedback, and
              customer-submitted images into structured quality insights, helping teams
              identify recurring product risks faster.
            </p>
            <div className="mt-8">
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E20010]"
              >
                View VOG Dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <div
                  key={step.label}
                  className="flex items-center gap-4 rounded-[20px] border border-[#e5e5e5] bg-white px-5 py-4"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      index === 0 ? 'bg-[#E20010] text-white' : 'bg-[#fafafa] text-black'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                      Signal {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black">{step.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {visionCards.map((card) => {
          const Icon = card.icon

          return (
            <Panel key={card.title} className="p-6 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e5e5e5] bg-[#fafafa] text-black">
                <Icon size={20} />
              </span>
              <h2 className="font-display mt-5 text-2xl font-semibold text-black">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#4a4a4a]">{card.text}</p>
            </Panel>
          )
        })}
      </section>

      <Panel className="p-7 sm:p-8">
        <SectionHeader
          eyebrow="Intelligence Pipeline"
          title="From guest signal to quality decision support."
          description="The dashboard keeps each layer visible so leaders can move from raw feedback into product-quality prioritization without losing the evidence trail."
        />
        <div className="mt-7 flex flex-col gap-3 xl:flex-row xl:items-center">
          {pipelineSteps.map((step, index) => {
            const Icon = step.icon

            return (
              <div key={step.label} className="flex flex-1 items-center gap-3">
                <div className="flex min-h-[88px] flex-1 items-center gap-3 rounded-[20px] border border-[#e5e5e5] bg-white px-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fafafa] text-black">
                    <Icon size={18} />
                  </span>
                  <p className="text-sm font-semibold text-black">{step.label}</p>
                </div>
                {index < pipelineSteps.length - 1 ? (
                  <ArrowRight className="hidden shrink-0 text-[#767676] xl:block" size={18} />
                ) : null}
              </div>
            )
          })}
        </div>
      </Panel>

      <section>
        <SectionHeader
          eyebrow="Quality Roadmap"
          title="VOG Today, VOP Tomorrow"
          description="The current site focuses on guest-facing evidence. The next phase can connect internal production signals to close the quality feedback loop."
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <PhaseList
            eyebrow="Current Phase"
            title="VOG Intelligence"
            items={currentPhase}
            icon={ShieldCheck}
          />
          <PhaseList
            eyebrow="Future Phase"
            title="VOG + VOP Comparison"
            items={futurePhase}
            icon={Sparkles}
          />
        </div>
      </section>

      <Panel className="border-[#f1c7cb] bg-[#fff9fa] p-7 sm:p-8">
        <p className="max-w-5xl text-lg font-semibold leading-8 text-black">
          The current version focuses on VOG. The next phase can connect VOP data to
          compare guest complaint patterns against internal production and quality signals.
        </p>
      </Panel>
    </div>
  )
}
