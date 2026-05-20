import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Download, Menu, Search } from 'lucide-react'
import { LOGO_PATH, navRoutes } from '../../data/constants'
import { useExportActions } from '../../hooks/useExport'
import { useProductFilter } from '../../context/ProductFilterContext'
import ProductStyleSelect from '../filters/ProductStyleSelect'

export default function Header({ onOpenSearch, onOpenMobileNav }) {
  const location = useLocation()
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)
  const { config, downloadCsv, downloadJson, downloadPng, printView } = useExportActions()
  const {
    dashboardTitle,
    loadingProducts,
    productOptions,
    selectedProductId,
    setSelectedProductId,
  } = useProductFilter()

  useEffect(() => {
    setExportOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClick(event) {
      if (!exportRef.current?.contains(event.target)) {
        setExportOpen(false)
      }
    }

    window.addEventListener('pointerdown', handleClick)
    return () => window.removeEventListener('pointerdown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto grid h-16 w-full max-w-[1680px] grid-cols-[auto_1fr_auto] items-center gap-4 px-3 sm:px-5 lg:px-6 xl:px-8">
        <Link to="/analytics" className="flex shrink-0 items-center gap-3 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
            <img
              src={LOGO_PATH}
              alt="lululemon logo"
              className="h-8 w-8 object-contain rounded-full"
            />
          </span>
          <span className="brand-mark text-[20px] text-black">lululemon</span>
          <span className="hidden h-4 w-px bg-[#e5e5e5] md:block" />
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-[#767676] md:block">
            {dashboardTitle}
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-6 md:flex">
          {navRoutes.map((route) => {
            return (
              <NavLink
                key={route.to}
                to={route.to}
                end={route.end}
                className={({ isActive }) =>
                  `relative shrink-0 whitespace-nowrap px-3 py-2 text-[14px] font-medium transition-colors duration-150 ${
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

        <div className="hidden items-center justify-self-end gap-2 md:flex">
          <ProductStyleSelect
            compact
            value={selectedProductId}
            options={productOptions}
            onChange={setSelectedProductId}
            disabled={loadingProducts}
          />
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-3 rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#4a4a4a] transition hover:border-black hover:text-black"
          >
            <Search size={15} />
            <span>Search</span>
            <span className="rounded-md bg-[#fafafa] px-2 py-1 text-[11px] text-[#767676]">
              Ctrl K
            </span>
          </button>

          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:border-black"
            >
              <Download size={15} />
              Export
              <ChevronDown size={15} />
            </button>

            {exportOpen ? (
              <div className="absolute right-0 mt-2 w-56 rounded-[20px] border border-[#e5e5e5] bg-white p-2 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={async () => {
                    await downloadPng(config?.fileName || 'dashboard-view.png')
                    setExportOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-black hover:bg-[#fafafa]"
                >
                  Download PNG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printView()
                    setExportOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-black hover:bg-[#fafafa]"
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  disabled={!config?.rows?.length}
                  onClick={() => {
                    downloadCsv(config.fileName || 'dashboard-export.csv', config.rows || [])
                    setExportOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-black hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Download CSV
                </button>
                <button
                  type="button"
                  disabled={!config?.json}
                  onClick={() => {
                    downloadJson(
                      (config.fileName || 'dashboard-export').replace(/\.csv$/i, '.json'),
                      config.json,
                    )
                    setExportOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-black hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Download JSON
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="col-start-3 flex items-center justify-self-end gap-2 md:hidden">
          <button
            type="button"
            onClick={onOpenSearch}
            className="rounded-xl border border-[#e5e5e5] bg-white p-2 text-black"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>
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
    </header>
  )
}
