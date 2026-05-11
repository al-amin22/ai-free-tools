import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types/database'

// BG gradient classes per slug
const CATEGORY_STYLES: Record<string, { gradient: string; border: string; cta: string }> = {
  'legal-documents':     { gradient: 'from-blue-50 to-blue-100',   border: 'border-blue-100',   cta: 'text-blue-700' },
  'real-estate':         { gradient: 'from-teal-50 to-teal-100',   border: 'border-teal-100',   cta: 'text-teal-700' },
  'hr-recruitment':      { gradient: 'from-purple-50 to-purple-100', border: 'border-purple-100', cta: 'text-purple-700' },
  'finance-tax':         { gradient: 'from-amber-50 to-amber-100', border: 'border-amber-100',  cta: 'text-amber-700' },
  'small-business':      { gradient: 'from-green-50 to-green-100', border: 'border-green-100',  cta: 'text-green-700' },
  'copywriting-content': { gradient: 'from-red-50 to-red-100',     border: 'border-red-100',    cta: 'text-red-700'   },
}

const DEFAULT_STYLE = { gradient: 'from-gray-50 to-gray-100', border: 'border-gray-100', cta: 'text-gray-700' }

interface CategoryGridProps {
  categories:  Category[]
  toolCounts:  Record<string, number>  // categoryId → tool count
}

export default function CategoryGrid({ categories, toolCounts }: CategoryGridProps) {
  return (
    <section
      aria-labelledby="categories-heading"
      className="bg-gray-50 py-16 px-4"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h2 id="categories-heading" className="text-3xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <p className="mt-2 text-gray-500">
            High-value tools for every area of your US business
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {categories.map((cat) => {
            const style = CATEGORY_STYLES[cat.slug] ?? DEFAULT_STYLE
            const count = toolCounts[cat.id] ?? 0

            return (
              <li key={cat.id}>
                <Link
                  href={`/tools/${cat.slug}`}
                  className={`group flex flex-col h-full rounded-2xl border bg-gradient-to-br ${style.gradient} ${style.border} p-6 hover:shadow-md transition-all`}
                >
                  {/* Icon + count */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl leading-none" aria-hidden>{cat.icon}</span>
                    <span className="text-xs font-semibold text-gray-400 bg-white/70 rounded-full px-2.5 py-1 border border-white/80">
                      {count} tools
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h3>

                  <p className="text-sm text-gray-600 leading-relaxed flex-1 line-clamp-3">
                    {cat.description}
                  </p>

                  <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all ${style.cta}`}>
                    View all tools
                    <ArrowRight size={14} aria-hidden />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
