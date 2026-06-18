export default function ProductStyleSelect({
  value,
  options = [],
  onChange,
  disabled = false,
  compact = false,
  className = '',
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 text-sm text-[#4a4a4a] ${className}`}>
      {!compact ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#767676] sm:tracking-[0.18em]">
          Product Style
        </span>
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`w-full min-w-0 rounded-xl border border-[#e5e5e5] bg-white text-sm text-[#000000] disabled:cursor-not-allowed disabled:opacity-60 ${
          compact ? 'px-4 py-2.5 lg:min-w-[220px]' : 'px-4 py-2'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
