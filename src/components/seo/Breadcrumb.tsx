'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import SchemaMarkup from './SchemaMarkup'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aifreetools.us'

// Maps URL path segments to human-readable labels.
// Add entries here as new sections are added to the site.
const SEGMENT_LABELS: Record<string, string> = {
  tools:    'Tools',
  blog:     'Blog',
  admin:    'Admin',
  // category slugs → pretty names handled via props override
}

function toLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ??
    segment
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  )
}

interface BreadcrumbItem {
  label: string
  href:  string
}

interface BreadcrumbProps {
  // Optional overrides — if not provided, items are derived from the URL
  items?: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname()

  const crumbs: BreadcrumbItem[] = items ?? (() => {
    const segments = pathname.split('/').filter(Boolean)
    const built: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]
    let path = ''
    for (const segment of segments) {
      path += `/${segment}`
      built.push({ label: toLabel(segment), href: path })
    }
    return built
  })()

  // JSON-LD BreadcrumbList
  const schemaItems = crumbs.map((crumb, i) => ({
    '@type':  'ListItem',
    position: i + 1,
    name:     crumb.label,
    item:     crumb.href.startsWith('http') ? crumb.href : `${SITE_URL}${crumb.href}`,
  }))

  const schema = {
    '@context':        'https://schema.org',
    '@type':           'BreadcrumbList',
    itemListElement:   schemaItems,
  }

  return (
    <>
      <SchemaMarkup schemas={schema} />

      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1 text-sm text-gray-500 ${className}`}
      >
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1

          return (
            <span key={crumb.href} className="flex items-center gap-1">
              {i === 0 ? (
                <Link
                  href={crumb.href}
                  aria-label="Home"
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Home size={14} />
                </Link>
              ) : isLast ? (
                <span className="text-gray-700 font-medium truncate max-w-[200px]" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-700 transition-colors truncate max-w-[160px]"
                >
                  {crumb.label}
                </Link>
              )}

              {!isLast && (
                <ChevronRight size={14} className="text-gray-300 shrink-0" aria-hidden />
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
