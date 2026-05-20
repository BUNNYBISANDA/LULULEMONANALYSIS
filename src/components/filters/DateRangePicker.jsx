export default function DateRangePicker({ from, to, onChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <label className="flex flex-col gap-1 text-sm text-[#4a4a4a]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
          From
        </span>
        <input
          type="date"
          value={from}
          onChange={(event) => onChange('from', event.target.value)}
          className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-[#4a4a4a]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
          To
        </span>
        <input
          type="date"
          value={to}
          onChange={(event) => onChange('to', event.target.value)}
          className="rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
        />
      </label>
    </div>
  )
}
