import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MobileNav from '../components/layout/MobileNav'
import CommandPalette from '../components/search/CommandPalette'
import { ExportProvider } from '../hooks/useExport'

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleHotkey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    window.addEventListener('keydown', handleHotkey)
    return () => window.removeEventListener('keydown', handleHotkey)
  }, [])

  useEffect(() => {
    setSearchOpen(false)
    setMobileOpen(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <ExportProvider>
      <div className="min-h-screen">
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <MobileNav
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
        <main
          key={location.pathname}
          className="mx-auto w-full max-w-[1680px] px-3 py-5 sm:px-5 sm:py-6 lg:px-6 xl:px-8"
          data-export-root="true"
        >
          {children}
        </main>
        <Footer />
      </div>
    </ExportProvider>
  )
}
