import { TIME_PERIOD_OPTIONS } from '../../data/constants'
import { useProductFilter } from '../../context/ProductFilterContext'

export default function TimePeriodFilter({ meta = '', className = '' }) {
  const { selectedTimePeriod, setSelectedTimePeriod } = useProductFilter()

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
          Time Period
        </span>
        <div className="inline-flex rounded-full border border-[#e5e5e5] bg-white p-1">
          {TIME_PERIOD_OPTIONS.map((option) => {
            const selected = option.value === selectedTimePeriod

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedTimePeriod(option.value)}
                className={`min-w-12 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'bg-black text-white'
                    : 'text-[#4a4a4a] hover:bg-[#fafafa] hover:text-black'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
      {meta ? <p className="text-sm text-[#767676]">{meta}</p> : null}
    </div>
  )
}
