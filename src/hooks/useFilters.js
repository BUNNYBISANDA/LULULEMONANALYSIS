import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ALL_FILTER_VALUE } from '../data/constants'

function parseValue(rawValue, fallback) {
  if (Array.isArray(fallback)) {
    return rawValue ? rawValue.split(',').filter(Boolean) : fallback
  }

  if (typeof fallback === 'boolean') {
    return rawValue === 'true'
  }

  return rawValue ?? fallback
}

export function useFilters(defaults) {
  const [stableDefaults] = useState(defaults)
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const next = {}

    Object.entries(stableDefaults).forEach(([key, fallback]) => {
      next[key] = parseValue(searchParams.get(key), fallback)
    })

    return next
  }, [searchParams, stableDefaults])

  const updateFilter = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams)
    const fallback = stableDefaults[key]
    const serialized = Array.isArray(value)
      ? value.join(',')
      : value === ALL_FILTER_VALUE || value === '' || value === null || value === undefined
        ? ''
        : String(value)

    const defaultSerialized = Array.isArray(fallback) ? fallback.join(',') : String(fallback)

    if (!serialized || serialized === defaultSerialized) {
      next.delete(key)
    } else {
      next.set(key, serialized)
    }

    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, stableDefaults])

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return {
    filters,
    updateFilter,
    resetFilters,
  }
}
