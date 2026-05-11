'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category, Tool } from '@/types/database'

interface PopularByCategoryProps {
  categories:     Category[]
  toolsByCategory: Record<string, Tool[]>  // categoryId → top 4 tools
}

const CATEGORY_ACTIVE: Record<string, string> = {
  'legal-documents':     'border-blue-600 text-blue-700   bg-blue-50',
  'real-estate':         'border-teal-600 text-teal-700   bg-teal-50',
  'hr-recruitment':      'border-purple-600 text-purple-700 bg-purple-50',
  'finance-tax':         'border-amber-600 text-amber-700 bg-amber-50',
  'small-business':      'border-green-600 text-green-700 bg-green-50',
  'copywriting-content': 'border-red-600   text-red-700   bg-red-50',
}

const CATEGORY_CTA: Record<string, string> = {
  'legal-documents':     'text-blue-600',
  'real-estate':         'text-teal-600',
  'hr-recruitment':      'text-purple-600',
  'finance-tax':         'text-amber-600',
  'small-business':      'text-green-600',
  'copywriting-content': 'text-red-600',
}

export default function PopularByCategory({
  categories,
  toolsByCategory,
}: PopularByCategoryProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '')

  const activeCategory = categories.find((c) => c.id === activeId)
  const tools          = activeCategory ? (toolsByCategory[activeId] ?? []) : []

  return (
    <section
      aria-labelledby="popular-heading"
      className="py-16 px-4 bg-white"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h2 id="popular-heading" className="text-3xl font-bold text-gray-900">
            Popular Tools by Category
          </h2>
          <p className="mt-2 text-gray-500">
            Top-rated free AI tools for US professionals
          </p>
        </div>

        {/* Category tab bar */}
        <div
          role="tablist"
          aria-label="Tool categories"
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeId
            const activeCls = CATEGORY_ACTIVE[cat.slug] ?? 'border-gray-600 text-gray-700 bg-gray-50'

            return (
              <button
                key={cat.id}
                role="tab"
                id={`tab-${cat.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${cat.id}`}
                onClick={() => setActiveId(cat.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? `${activeCls} shadow-sm`
                    : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                }`}
              >
                <span aria-hidden>{cat.icon}</span>
                <span className="hidden sm:inline">{cat.name}</span>
                <span className="sm:hidden">{cat.name.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Tool panel */}
        {activeCategory && (
          <div
            role="tabpanel"
            id={`panel-${activeCategory.id}`}
            aria-labelledby={`tab-${activeCategory.id}`}
          >
            {tools.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No tools available yet.</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
                {tools.map((tool) => {
                  const ctaCls = CATEGORY_CTA[activeCategory.slug] ?? 'text-gray-600'

                  return (
                    <li key={tool.id}>
                      <Link
                        href={`/tools/${activeCategory.slug}/${tool.slug}`}
                        className="group flex flex-col h-full rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:shadow-md transition-all"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 mb-2 line-clamp-2">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-3">
                          {tool.description}
                        </p>
                        <span className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-1.5 transition-all ${ctaCls}`}>
                          Use Free <ArrowRight size={11} aria-hidden />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="text-center mt-6">
              <Link
                href={`/tools/${activeCategory.slug}`}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4 ${CATEGORY_CTA[activeCategory.slug] ?? 'text-gray-600'}`}
              >
                See all {activeCategory.name} tools
                <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
