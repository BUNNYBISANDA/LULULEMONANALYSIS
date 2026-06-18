export default function DateRangePicker({ from, to, onChange }) {
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1 text-sm text-[#4a4a4a]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.18em]">
          From
        </span>
        <input
          type="date"
          value={from}
          onChange={(event) => onChange('from', event.target.value)}
          className="w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm text-[#4a4a4a]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.18em]">
          To
        </span>
        <input
          type="date"
          value={to}
          onChange={(event) => onChange('to', event.target.value)}
          className="w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#000000]"
        />
      </label>
    </div>
  )
}
