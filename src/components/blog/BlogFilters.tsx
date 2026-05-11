'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import type { Category } from '@/types/database'

interface BlogFiltersProps {
  categories:      Category[]
  currentSearch?:  string
  currentCategory?: string
}

export default function BlogFilters({
  categories,
  currentSearch   = '',
  currentCategory = '',
}: BlogFiltersProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const inputRef     = useRef<HTMLInputElement>(null)

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else       params.delete(key)
    params.delete('page')  // reset to page 1 on any filter change
    router.push(`/blog${params.size ? `?${params}` : ''}`)
  }, [router, searchParams])

  function clearSearch() {
    if (inputRef.current) inputRef.current.value = ''
    update('q', '')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3" role="search" aria-label="Filter articles">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          defaultValue={currentSearch}
          placeholder="Search articles…"
          aria-label="Search articles"
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value)
          }}
          className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-9 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
        />
        {currentSearch && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category dropdown */}
      <select
        defaultValue={currentCategory}
        onChange={(e) => update('category', e.target.value)}
        aria-label="Filter by category"
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition sm:w-52"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>
    </div>
  )
}
