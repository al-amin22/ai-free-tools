import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Tool } from '@/types/database'

interface FeaturedToolsProps {
  tools: Tool[]
}

// Category slug → color classes (matches seed-categories.sql hex)
const CATEGORY_COLORS: Record<string, string> = {
  'legal-documents':     'bg-blue-50 text-blue-700 border-blue-100',
  'real-estate':         'bg-teal-50 text-teal-700 border-teal-100',
  'hr-recruitment':      'bg-purple-50 text-purple-700 border-purple-100',
  'finance-tax':         'bg-amber-50 text-amber-700 border-amber-100',
  'small-business':      'bg-green-50 text-green-700 border-green-100',
  'copywriting-content': 'bg-red-50 text-red-700 border-red-100',
}

export default function FeaturedTools({ tools }: FeaturedToolsProps) {
  if (!tools.length) return null

  return (
    <section aria-labelledby="featured-heading" className="py-16 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h2 id="featured-heading" className="text-3xl font-bold text-gray-900">
            Most Popular Free AI Tools
          </h2>
          <p className="mt-2 text-gray-500">
            Trusted by tens of thousands of US professionals every month
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {tools.map((tool) => {
            const catSlug  = tool.category?.slug ?? ''
            const badgeCls = CATEGORY_COLORS[catSlug] ?? 'bg-gray-50 text-gray-700 border-gray-100'
            const href     = `/tools/${catSlug}/${tool.slug}`

            return (
              <li key={tool.id}>
                <Link
                  href={href}
                  className="group flex flex-col h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
                >
                  {/* Category badge */}
                  <span className={`self-start mb-4 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeCls}`}>
                    <span aria-hidden>{tool.category?.icon}</span>
                    {tool.category?.name}
                  </span>

                  {/* Tool name */}
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {tool.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">
                    {tool.description}
                  </p>

                  {/* CTA */}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
                    Generate Free
                    <ArrowRight size={14} aria-hidden />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="text-center mt-8">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Browse All 65 Free Tools
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
