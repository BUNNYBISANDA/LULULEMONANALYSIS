import { Link, NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { LOGO_PATH, navRoutes } from '../../data/constants'
import { useProductFilter } from '../../context/ProductFilterContext'
import ProductStyleSelect from '../filters/ProductStyleSelect'

export default function MobileNav({ open, onClose }) {
  const location = useLocation()
  const {
    dashboardTitle,
    loadingProducts,
    productOptions,
    selectedProductId,
    setSelectedProductId,
  } = useProductFilter()
  const isVisionPage = location.pathname === '/'

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
        aria-label="Close navigation"
      />
      <aside className="absolute right-0 top-0 flex h-full w-[86vw] max-w-sm flex-col border-l border-[#e5e5e5] bg-white px-5 py-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
              Navigation
            </p>
            <Link to="/" onClick={onClose} className="mt-2 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                <img
                  src={LOGO_PATH}
                  alt="lululemon logo"
                  className="h-8 w-8 rounded-full object-contain"
                />
              </span>
              <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#000000]">
                LULULEMON
              </span>
            </Link>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#767676]">
              {dashboardTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5e5e5] bg-white p-2 text-black"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {!isVisionPage ? (
          <ProductStyleSelect
            value={selectedProductId}
            options={productOptions}
            onChange={setSelectedProductId}
            disabled={loadingProducts}
            className="mt-5"
          />
        ) : null}

        <nav className="mt-6 flex flex-col gap-2">
          {navRoutes.map((route) => {
            return (
              <NavLink
                key={route.to}
                to={route.to}
                end={route.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'border-black bg-black text-white'
                      : 'border-[#e5e5e5] bg-white text-black hover:border-black'
                  }`
                }
              >
                {route.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
