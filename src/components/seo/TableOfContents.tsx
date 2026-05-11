'use client'

import { useEffect, useRef, useState } from 'react'
import { List } from 'lucide-react'

interface TocItem {
  id:       string
  text:     string
  level:    2 | 3
  children: TocItem[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Parse H2 and H3 tags from raw HTML article content
function parseHeadings(html: string): TocItem[] {
  // Run in browser only — use DOMParser for accuracy
  if (typeof window === 'undefined') return []

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const headings = Array.from(doc.querySelectorAll('h2, h3'))

  const result: TocItem[] = []
  let lastH2: TocItem | null = null

  for (const el of headings) {
    const level = parseInt(el.tagName[1]) as 2 | 3
    const text  = el.textContent?.trim() ?? ''
    const id    = el.id || slugify(text)

    const item: TocItem = { id, text, level, children: [] }

    if (level === 2) {
      result.push(item)
      lastH2 = item
    } else if (level === 3 && lastH2) {
      lastH2.children.push(item)
    } else {
      // H3 with no preceding H2 — treat as top-level
      result.push(item)
    }
  }

  return result
}

// Inject id attributes into headings in the DOM so anchor links work
function injectHeadingIds(containerSelector: string) {
  const container = document.querySelector(containerSelector)
  if (!container) return

  container.querySelectorAll('h2, h3').forEach((el) => {
    if (!el.id) {
      el.id = slugify(el.textContent?.trim() ?? '')
    }
  })
}

interface TableOfContentsProps {
  content: string          // raw HTML article content
  contentSelector?: string // CSS selector of the article container in the DOM
  className?: string
}

export default function TableOfContents({
  content,
  contentSelector = 'article',
  className = '',
}: TableOfContentsProps) {
  const [items, setItems]       = useState<TocItem[]>([])
  const [active, setActive]     = useState<string>('')
  const observerRef             = useRef<IntersectionObserver | null>(null)

  // Parse TOC from content on mount
  useEffect(() => {
    const parsed = parseHeadings(content)
    setItems(parsed)
    if (parsed.length) setActive(parsed[0].id)
  }, [content])

  // Inject IDs and set up IntersectionObserver for active tracking
  useEffect(() => {
    if (!items.length) return

    injectHeadingIds(contentSelector)

    const allIds = items.flatMap((h) => [h.id, ...h.children.map((c) => c.id)])

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    )

    allIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observerRef.current!.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [items, contentSelector])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 80  // account for sticky header height
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setActive(id)
  }

  if (!items.length) return null

  return (
    <nav
      aria-label="Table of contents"
      className={`sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        <List size={14} />
        <span>Contents</span>
      </div>

      <ol className="space-y-1">
        {items.map((h2) => (
          <li key={h2.id}>
            <button
              onClick={() => scrollTo(h2.id)}
              className={`w-full text-left text-sm leading-snug py-0.5 transition-colors ${
                active === h2.id
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {h2.text}
            </button>

            {h2.children.length > 0 && (
              <ol className="pl-3 mt-1 space-y-1 border-l border-gray-100">
                {h2.children.map((h3) => (
                  <li key={h3.id}>
                    <button
                      onClick={() => scrollTo(h3.id)}
                      className={`w-full text-left text-xs leading-snug py-0.5 transition-colors ${
                        active === h3.id
                          ? 'text-blue-600 font-medium'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {h3.text}
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
