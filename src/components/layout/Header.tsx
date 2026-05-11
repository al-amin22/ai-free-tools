import Link from 'next/link'
import { getAllCategories } from '@/lib/db/categories'
import MobileNav from './MobileNav'
import { Zap } from 'lucide-react'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'

export default async function Header() {
  const categories = await getAllCategories()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label={`${SITE_NAME} home`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Zap size={16} className="text-white" aria-hidden />
            </span>
            <span className="text-base font-bold text-gray-900 hidden sm:block">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {/* Tools dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                aria-haspopup="true"
              >
                Tools
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M4.5 6.5L8 10l3.5-3.5H4.5z" />
                </svg>
              </button>

              {/* Mega dropdown */}
              <div className="absolute left-0 top-full mt-1 hidden group-hover:grid grid-cols-2 gap-1 w-72 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/tools/${cat.slug}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base leading-none" aria-hidden>{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </Link>
                ))}
                <Link
                  href="/tools"
                  className="col-span-2 mt-1 rounded-lg border border-gray-100 px-3 py-2 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Browse all {categories.reduce((n) => n, 0)} categories →
                </Link>
              </div>
            </div>

            <Link href="/blog"  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Blog</Link>
            <Link href="/about" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">About</Link>
          </nav>

          {/* Desktop search */}
          <form
            action="/search"
            method="GET"
            role="search"
            className="hidden md:flex items-center flex-1 max-w-xs"
          >
            <label htmlFor="site-search" className="sr-only">Search tools</label>
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder="Search 65 free tools…"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </form>

          {/* Mobile nav trigger — rendered as client component */}
          <MobileNav categories={categories} />
        </div>
      </div>
    </header>
  )
}
