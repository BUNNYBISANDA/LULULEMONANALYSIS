export default function Panel({ children, className = '' }) {
  return (
    <div
      className={`soft-card min-w-0 rounded-[20px] border border-[#e5e5e5] bg-white ${className}`}
    >
      {children}
    </div>
  )
}
