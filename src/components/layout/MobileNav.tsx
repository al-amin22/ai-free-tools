'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Category } from '@/types/database'

interface MobileNavProps {
  categories: Category[]
}

export default function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen]           = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  function close() { setOpen(false); setToolsOpen(false) }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-16 z-40 bg-white overflow-y-auto border-t border-gray-200"
        >
          <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
            {/* Search */}
            <form action="/search" method="GET" role="search" className="mb-2">
              <label htmlFor="mobile-search" className="sr-only">Search tools</label>
              <input
                id="mobile-search"
                name="q"
                type="search"
                placeholder="Search 65 free tools…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm focus:border-blue-400 focus:outline-none"
              />
            </form>

            {/* Tools accordion */}
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className="flex items-center justify-between w-full rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Tools
              {toolsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {toolsOpen && (
              <div className="pl-4 flex flex-col gap-0.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/tools/${cat.slug}`}
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span aria-hidden>{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/blog"    onClick={close} className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">Blog</Link>
            <Link href="/about"   onClick={close} className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50">About</Link>
            <Link href="/privacy" onClick={close} className="rounded-lg px-4 py-3 text-sm text-gray-500 hover:bg-gray-50">Privacy Policy</Link>
          </nav>
        </div>
      )}
    </>
  )
}
