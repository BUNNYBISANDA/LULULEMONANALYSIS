export default function FilterBar({ children, className = '' }) {
  return (
    <div
      className={`sticky top-20 z-20 rounded-[20px] border border-[#e5e5e5] bg-white p-4 ${className}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        {children}
      </div>
    </div>
  )
}
