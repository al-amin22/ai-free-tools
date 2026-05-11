import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import type { Tool } from '@/types/database'

const CATEGORY_BADGE: Record<string, string> = {
  'legal-documents':     'bg-blue-50   text-blue-700   border-blue-100',
  'real-estate':         'bg-teal-50   text-teal-700   border-teal-100',
  'hr-recruitment':      'bg-purple-50 text-purple-700 border-purple-100',
  'finance-tax':         'bg-amber-50  text-amber-700  border-amber-100',
  'small-business':      'bg-green-50  text-green-700  border-green-100',
  'copywriting-content': 'bg-red-50    text-red-700    border-red-100',
}

const CATEGORY_CTA: Record<string, string> = {
  'legal-documents':     'group-hover:text-blue-600',
  'real-estate':         'group-hover:text-teal-600',
  'hr-recruitment':      'group-hover:text-purple-600',
  'finance-tax':         'group-hover:text-amber-600',
  'small-business':      'group-hover:text-green-600',
  'copywriting-content': 'group-hover:text-red-600',
}

interface ToolCardProps {
  tool:         Tool
  categorySlug: string
  priority?:    boolean  // show "popular" badge
}

export default function ToolCard({ tool, categorySlug, priority = false }: ToolCardProps) {
  const href      = `/tools/${categorySlug}/${tool.slug}`
  const badgeCls  = CATEGORY_BADGE[categorySlug] ?? 'bg-gray-50 text-gray-700 border-gray-100'
  const ctaCls    = CATEGORY_CTA[categorySlug]   ?? 'group-hover:text-gray-700'

  return (
    <Link
      href={href}
      className="group relative flex flex-col h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
    >
      {/* Popular badge */}
      {priority && (
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-600">
          <TrendingUp size={9} aria-hidden />
          Popular
        </span>
      )}

      {/* Primary keyword badge */}
      {tool.primary_keyword && (
        <span className={`self-start mb-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badgeCls}`}>
          {tool.primary_keyword}
        </span>
      )}

      {/* Tool name */}
      <h3 className={`text-sm font-semibold text-gray-900 mb-2 leading-snug transition-colors ${ctaCls}`}>
        {tool.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-3">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {tool.view_count > 0 ? `${tool.view_count.toLocaleString('en-US')} uses` : 'Free'}
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold text-gray-600 group-hover:gap-1.5 transition-all ${ctaCls}`}>
          Use Free <ArrowRight size={11} aria-hidden />
        </span>
      </div>
    </Link>
  )
}
