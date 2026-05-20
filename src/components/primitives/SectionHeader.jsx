export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
  titlePrefix = null,
}) {
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-3xl text-center' : ''} ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
        {eyebrow}
      </p>
      <div
        className={`mt-3 flex gap-3 ${
          align === 'center' ? 'items-center justify-center' : 'items-center'
        }`}
      >
        {titlePrefix}
        <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[#000000] sm:text-3xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4a4a4a] sm:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  )
}
