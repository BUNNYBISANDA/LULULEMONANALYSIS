import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { LOGO_PATH, navRoutes } from '../../data/constants'
import { useProductFilter } from '../../context/ProductFilterContext'
import ProductStyleSelect from '../filters/ProductStyleSelect'

export default function Header({ onOpenMobileNav }) {
  const location = useLocation()
  const {
    dashboardTitle,
    loadingProducts,
    productOptions,
    selectedProductId,
    setSelectedProductId,
  } = useProductFilter()
  const isVisionPage = location.pathname === '/'

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid min-h-16 w-full max-w-[1680px] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-5 lg:h-16 lg:px-6 lg:py-0 xl:px-8">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2 no-underline sm:gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
            <img
              src={LOGO_PATH}
              alt="lululemon logo"
              className="h-8 w-8 object-contain rounded-full"
            />
          </span>
          <span className="truncate text-[12px] font-bold uppercase tracking-[0.12em] text-black sm:text-[13px] sm:tracking-[0.18em]">
            LULULEMON
          </span>
          <span className="hidden h-4 w-px bg-[#e5e5e5] xl:block" />
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-[#767676] xl:block">
            {dashboardTitle}
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex xl:gap-3">
          {navRoutes.map((route) => {
            return (
              <NavLink
                key={route.to}
                to={route.to}
                end={route.end}
                className={({ isActive }) =>
                  `relative shrink-0 whitespace-nowrap px-2 py-2 text-[13px] font-medium transition-colors duration-150 xl:px-3 xl:text-[14px] ${
                    isActive
                      ? 'text-black after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-[#E20010]'
                      : 'text-[#767676] hover:text-black'
                  }`
                }
              >
                {route.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="hidden items-center justify-self-end gap-2 lg:flex">
          {!isVisionPage ? (
            <ProductStyleSelect
              compact
              value={selectedProductId}
              options={productOptions}
              onChange={setSelectedProductId}
              disabled={loadingProducts}
            />
          ) : null}
        </div>

        <div className="col-start-3 flex items-center justify-self-end gap-2 lg:hidden">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="rounded-xl border border-[#e5e5e5] bg-white p-2 text-black"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {!isVisionPage ? (
        <div className="border-t border-[#f0f0f0] px-4 py-3 sm:px-5 lg:hidden">
          <ProductStyleSelect
            compact
            value={selectedProductId}
            options={productOptions}
            onChange={setSelectedProductId}
            disabled={loadingProducts}
            className="w-full"
          />
        </div>
      ) : null}
    </header>
  )
}
