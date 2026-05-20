import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import Panel from '../primitives/Panel'
import Skeleton from '../primitives/Skeleton'
import { loadDashboardBundle } from '../../data/loaders'
import { buildDashboardData, filterSearchIndex } from '../../data/selectors'

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [state, setState] = useState({
    loading: false,
    error: null,
    index: [],
  })

  useEffect(() => {
    if (!open) {
      setQuery('')
      setActiveIndex(0)
      return
    }

    inputRef.current?.focus()

    if (state.index.length || state.loading) {
      return
    }

    let active = true

    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    loadDashboardBundle(true)
      .then((bundle) => {
        if (!active) {
          return
        }

        const dashboard = buildDashboardData(bundle, 'all')
        setState({
          loading: false,
          error: null,
          index: dashboard.searchIndex,
        })
      })
      .catch((error) => {
        if (!active) {
          return
        }

        setState({
          loading: false,
          error,
          index: [],
        })
      })

    return () => {
      active = false
    }
  }, [open, state.index.length, state.loading])

  const results = useMemo(() => filterSearchIndex(state.index, query), [query, state.index])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)))
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((index) => Math.max(index - 1, 0))
      }

      if (event.key === 'Enter' && results[activeIndex]) {
        event.preventDefault()
        navigate(results[activeIndex].path)
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [activeIndex, navigate, onClose, open, results])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/35 px-4 py-8 sm:py-12">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close search"
      />
      <Panel className="relative z-10 w-full max-w-3xl overflow-hidden bg-white">
        <div className="flex items-center gap-3 border-b border-[#e5e5e5] px-5 py-4">
          <Search size={18} className="text-[#767676]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search analytics, reviews, and low-star review text"
            className="w-full border-none bg-transparent text-[15px] text-[#000000] outline-none placeholder:text-[#a8a8a8]"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5e5e5] bg-white p-2 text-[#000000]"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-3">
          {state.loading ? (
            <div className="space-y-3 p-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : state.error ? (
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 text-sm text-[#4a4a4a]">
              Search could not load right now. Try refreshing the page.
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-5 text-sm text-[#4a4a4a]">
              No matching pages or reviews found.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={`${result.group}-${result.label}-${result.path}`}
                  type="button"
                  onClick={() => {
                    navigate(result.path)
                    onClose()
                  }}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    index === activeIndex ? 'bg-[#000000] text-white' : 'hover:bg-[#fafafa]'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#767676]">
                    {result.group}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold">{result.label}</p>
                  <p
                    className={`mt-1 text-sm leading-6 ${
                      index === activeIndex ? 'text-white/75' : 'text-[#4a4a4a]'
                    }`}
                  >
                    {result.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}
