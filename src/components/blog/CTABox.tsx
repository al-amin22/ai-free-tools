import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import type { Tool } from '@/types/database'

interface CTABoxProps {
  tool:         Tool
  categorySlug: string
  variant?:     'default' | 'compact'
  className?:   string
}

export default function CTABox({
  tool,
  categorySlug,
  variant   = 'default',
  className = '',
}: CTABoxProps) {
  const href = `/tools/${categorySlug}/${tool.slug}`

  if (variant === 'compact') {
    return (
      <aside
        className={`my-8 flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 ${className}`}
        aria-label="Related tool"
      >
        <Zap size={20} className="shrink-0 text-blue-500" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{tool.name}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
        >
          Try Free →
        </Link>
      </aside>
    )
  }

  return (
    <aside
      className={`my-10 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg ${className}`}
      aria-label="Try this free AI tool"
    >
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/20" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
      </div>

      <div className="relative p-7 sm:p-8">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
          <Zap size={11} aria-hidden />
          Free AI Tool
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
          {tool.name}
        </h3>

        <p className="text-blue-100 text-sm leading-relaxed mb-6 max-w-lg">
          {tool.description ?? `Generate professional ${tool.name.toLowerCase()} instantly — no templates, no sign up required.`}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
          >
            Generate Free
            <ArrowRight size={15} aria-hidden />
          </Link>

          <ul className="flex items-center gap-3 text-xs text-blue-100">
            {['100% Free', 'No Sign Up', 'Instant'].map((badge) => (
              <li key={badge} className="flex items-center gap-1">
                <span className="text-green-300" aria-hidden>✓</span>
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  )
}
