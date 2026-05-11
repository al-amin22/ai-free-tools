import type { Metadata } from 'next'
import Link              from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getFilteredArticles, countPublishedArticles, getLatestArticles } from '@/lib/db/articles'
import { getAllCategories }  from '@/lib/db/categories'
import AdManager            from '@/components/ads/AdManager'
import ArticleCard          from '@/components/blog/ArticleCard'
import BlogFilters          from '@/components/blog/BlogFilters'
import type { Category }    from '@/types/database'

// ─── ISR ─────────────────────────────────────────────────────────────────────

export const revalidate = 21600

// ─── Metadata ─────────────────────────────────────────────────────────────────

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://aifreetools.us'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<Record<string, string>> }
): Promise<Metadata> {
  const p     = await searchParams
  const page  = Number(p.page ?? 1)
  const title = page > 1
    ? `Blog — Page ${page} | ${SITE_NAME}`
    : `AI Legal & Business Blog — Guides & Resources | ${SITE_NAME}`
  const description =
    'Free guides on US legal documents, real estate, HR, finance, and small business. Expert AI-generated content for American professionals.'
  const canonical = `${SITE_URL}/blog${page > 1 ? `?page=${page}` : ''}`

  return {
    title,
    description,
    alternates: { canonical, languages: { 'en-US': canonical } },
    openGraph: {
      type:        'website',
      title,
      description,
      url:         canonical,
      locale:      'en_US',
      siteName:    SITE_NAME,
    },
    robots: { index: true, follow: true },
  }
}

// ─── Pagination helper ────────────────────────────────────────────────────────

const PER_PAGE = 12

function PaginationLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      aria-label={label}
    >
      {icon}
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage(
  { searchParams }: { searchParams: Promise<Record<string, string>> }
) {
  const p          = await searchParams
  const currentPage = Math.max(1, Number(p.page ?? 1))
  const search      = p.q       ?? ''
  const catSlug     = p.category ?? ''

  // Load categories for filter dropdown
  const categories = await getAllCategories()
  const catMap      = new Map<string, Category>(categories.map((c) => [c.id, c]))
  const filterCat   = categories.find((c) => c.slug === catSlug)

  const isFiltered = Boolean(search || catSlug)
  const offset     = (currentPage - 1) * PER_PAGE

  const [articles, total, featured] = await Promise.all([
    getFilteredArticles({
      limit:      PER_PAGE,
      offset,
      categoryId: filterCat?.id ?? null,
      search:     search || null,
    }),
    countPublishedArticles({
      categoryId: filterCat?.id ?? null,
      search:     search || null,
    }),
    // Featured articles: top 3 latest, only on unfiltered page 1
    (!isFiltered && currentPage === 1) ? getLatestArticles(3) : Promise.resolve([]),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  // Build pagination URL helper
  function pageUrl(n: number) {
    const params = new URLSearchParams()
    if (search)  params.set('q', search)
    if (catSlug) params.set('category', catSlug)
    if (n > 1)   params.set('page', String(n))
    return `/blog${params.size ? `?${params}` : ''}`
  }

  return (
    <div>
      {/* ── AdSense Leaderboard — TOP ──────────────────────────────────── */}
      <div className="flex justify-center bg-white border-b border-gray-100 py-3">
        <AdManager placement="top" categorySlug="blog" toolSlug="blog" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            {catSlug
              ? `${filterCat?.name ?? 'Category'} Guides & Resources`
              : 'AI Legal & Business Blog'}
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Free guides and resources for US legal documents, real estate, HR, finance, and small business.
          </p>
        </header>

        {/* ── Search + filter ──────────────────────────────────────────── */}
        <div className="mb-8">
          <BlogFilters
            categories={categories}
            currentSearch={search}
            currentCategory={catSlug}
          />
        </div>

        {/* ── Featured articles (page 1, no filters) ───────────────────── */}
        {featured.length > 0 && (
          <section aria-labelledby="featured-heading" className="mb-12">
            <h2 id="featured-heading" className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
              Featured
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  category={article.category_id ? catMap.get(article.category_id) : null}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Article list ─────────────────────────────────────────────── */}
        {articles.length > 0 ? (
          <section aria-labelledby="articles-heading">
            {(isFiltered || currentPage > 1) && (
              <h2 id="articles-heading" className="sr-only">Articles</h2>
            )}
            {!isFiltered && currentPage === 1 && (
              <h2 id="articles-heading" className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
                All Articles
              </h2>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  category={article.category_id ? catMap.get(article.category_id) : null}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center">
            <p className="text-gray-400 text-sm">No articles found.</p>
            <Link href="/blog" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              View all articles
            </Link>
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-12 flex items-center justify-center gap-2"
          >
            {currentPage > 1 && (
              <PaginationLink
                href={pageUrl(currentPage - 1)}
                label="Previous page"
                icon={<><ChevronLeft size={16} aria-hidden /><span>Previous</span></>}
              />
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => Math.abs(n - currentPage) <= 2 || n === 1 || n === totalPages)
                .reduce<(number | '…')[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((item, i) =>
                  item === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <Link
                      key={item}
                      href={pageUrl(item as number)}
                      aria-label={`Page ${item}`}
                      aria-current={item === currentPage ? 'page' : undefined}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        item === currentPage
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </Link>
                  )
                )}
            </div>

            {currentPage < totalPages && (
              <PaginationLink
                href={pageUrl(currentPage + 1)}
                label="Next page"
                icon={<><span>Next</span><ChevronRight size={16} aria-hidden /></>}
              />
            )}
          </nav>
        )}

        {/* ── Total count ──────────────────────────────────────────────── */}
        {total > 0 && (
          <p className="mt-4 text-center text-xs text-gray-400">
            {total} article{total !== 1 ? 's' : ''} · Page {currentPage} of {totalPages}
          </p>
        )}

        {/* ── AdSense Leaderboard — BOTTOM ─────────────────────────────── */}
        <div className="flex justify-center mt-12">
          <AdManager placement="bottom" categorySlug="blog" toolSlug="blog" />
        </div>

      </div>
    </div>
  )
}
