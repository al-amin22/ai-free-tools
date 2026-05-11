import { notFound }    from 'next/navigation'
import type { Metadata } from 'next'
import Link              from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'

import { getAllPublishedSlugs, getArticleBySlug, getRelatedArticles, getLatestArticles } from '@/lib/db/articles'
import { getToolById }             from '@/lib/db/tools'
import { getCategoryBySlug, getAllCategories } from '@/lib/db/categories'
import { generateArticleMetadata } from '@/lib/seo/metadata'
import { articleSchema }           from '@/lib/seo/schema'
import SchemaMarkup                from '@/components/seo/SchemaMarkup'
import Breadcrumb                  from '@/components/seo/Breadcrumb'
import TableOfContents             from '@/components/seo/TableOfContents'
import AdManager                   from '@/components/ads/AdManager'
import ArticleCard                 from '@/components/blog/ArticleCard'
import CTABox                      from '@/components/blog/CTABox'
import type { Category }           from '@/types/database'

// ─── ISR ─────────────────────────────────────────────────────────────────────

export const revalidate = 43200

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article  = await getArticleBySlug(slug)
  if (!article) return {}
  return generateArticleMetadata(article)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** Split HTML at each <h2> start — keeps the tag with its section. */
function splitByH2(html: string): string[] {
  const parts = html.split(/(?=<h2[\s>])/i).filter((s) => s.trim())
  return parts.length > 0 ? parts : [html]
}

/** Extract FAQ Q&A pairs from HTML (looks for FAQ <h2> + <h3>/<p> pairs). */
function extractFaqFromHtml(html: string): Array<{ q: string; a: string }> {
  const faqBlock = html.match(
    /<h2[^>]*>[^<]*(?:FAQ|Frequently Asked)[^<]*<\/h2>([\s\S]*?)(?=<h2|$)/i
  )?.[1]
  if (!faqBlock) return []

  const entries: Array<{ q: string; a: string }> = []
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(faqBlock)) !== null) {
    entries.push({
      q: m[1].replace(/<[^>]+>/g, '').trim(),
      a: m[2].replace(/<[^>]+>/g, '').trim(),
    })
  }
  return entries
}

// ─── Prose section renderer ───────────────────────────────────────────────────

function ArticleSection({ html }: { html: string }) {
  return (
    <div
      className="prose prose-gray max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-5 prose-p:leading-relaxed prose-a:text-blue-600 prose-li:text-gray-700"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug }  = await params
  const article   = await getArticleBySlug(slug)
  if (!article) notFound()

  // Secondary data — parallel
  const allCategories = await getAllCategories()
  const catMap        = new Map<string, Category>(allCategories.map((c) => [c.id, c]))
  const category      = article.category_id ? catMap.get(article.category_id) ?? null : null

  const [relatedArticles, relatedTool, latestArticles] = await Promise.all([
    getRelatedArticles(article.id, article.category_id, 3),
    article.tool_id ? getToolById(article.tool_id) : Promise.resolve(null),
    getLatestArticles(5),
  ])

  const toolCategory = relatedTool?.category ?? null
  const catSlug      = (toolCategory as Category | null)?.slug ?? category?.slug ?? 'blog'

  const readTime = Math.max(1, Math.ceil((article.word_count ?? 0) / 200))
  const faqs     = extractFaqFromHtml(article.content)
  const schemas  = articleSchema(article, faqs.length ? faqs : undefined)

  const sections    = splitByH2(article.content)
  const intro       = sections[0] ?? ''
  const bodySections = sections.slice(1)

  return (
    <>
      <SchemaMarkup schemas={schemas} />

      {/* ── AdSense Leaderboard — TOP ─────────────────────────────────── */}
      <div className="flex justify-center bg-white border-b border-gray-100 py-3">
        <AdManager placement="top" categorySlug={catSlug} toolSlug={slug} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ────────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: 'Home',  href: '/' },
            { label: 'Blog',  href: '/blog' },
            ...(category ? [{ label: category.name, href: `/blog?category=${category.slug}` }] : []),
            { label: article.title, href: `/blog/${slug}` },
          ]}
          className="mb-6"
        />

        {/* Two-column: article body + sticky sidebar */}
        <div className="flex gap-10 items-start">

          {/* ── MAIN COLUMN ───────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* ── Article header ─────────────────────────────────────── */}
            <header className="mb-8">
              {/* Category badge */}
              {category && (
                <Link
                  href={`/blog?category=${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color ?? '#3B82F6',
                  }}
                >
                  <span aria-hidden>{category.icon}</span>
                  {category.name}
                </Link>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                {article.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} aria-hidden />
                  <time dateTime={article.published_at ?? article.created_at}>
                    {formatDate(article.published_at ?? article.created_at)}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} aria-hidden />
                  {readTime} min read
                </span>
                {article.word_count > 0 && (
                  <span className="text-gray-400">
                    {article.word_count.toLocaleString()} words
                  </span>
                )}
              </div>
            </header>

            {/* ── Article body ───────────────────────────────────────── */}
            <article id="article-content">

              {/* Intro section */}
              <ArticleSection html={intro} />

              {/* AdSense InArticle — after intro */}
              <div className="my-8">
                <AdManager placement="in-article" categorySlug={catSlug} toolSlug={slug} />
              </div>

              {/* First CTA — after 2nd body section */}
              {bodySections.map((section, i) => (
                <div key={i}>
                  <ArticleSection html={section} />

                  {i === 1 && relatedTool && (
                    <CTABox
                      tool={relatedTool}
                      categorySlug={(toolCategory as Category | null)?.slug ?? catSlug}
                    />
                  )}

                  {i === 3 && (
                    <>
                      <div className="my-8">
                        <AdManager placement="in-article" categorySlug={catSlug} toolSlug={slug} />
                      </div>
                      {relatedTool && (
                        <CTABox
                          tool={relatedTool}
                          categorySlug={(toolCategory as Category | null)?.slug ?? catSlug}
                          variant="compact"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}

            </article>

            {/* ── Related Tools ──────────────────────────────────────── */}
            {relatedTool && (
              <section aria-labelledby="tool-heading" className="mt-12 mb-8">
                <h2 id="tool-heading" className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="text-blue-500" aria-hidden>⚡</span>
                  Try the Free AI Tool
                </h2>
                <CTABox
                  tool={relatedTool}
                  categorySlug={(toolCategory as Category | null)?.slug ?? catSlug}
                />
              </section>
            )}

            {/* ── Related Articles ───────────────────────────────────── */}
            {relatedArticles.length > 0 && (
              <section aria-labelledby="related-heading" className="mb-10">
                <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BookOpen size={18} className="text-gray-400" aria-hidden />
                  Related Articles
                </h2>
                <ul className="grid gap-4 sm:grid-cols-3" role="list">
                  {relatedArticles.map((ra) => (
                    <li key={ra.id}>
                      <ArticleCard
                        article={ra}
                        category={ra.category_id ? catMap.get(ra.category_id) : null}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── AdSense Leaderboard — BOTTOM ───────────────────────── */}
            <div className="flex justify-center mt-6">
              <AdManager placement="bottom" categorySlug={catSlug} toolSlug={slug} />
            </div>

          </div>{/* end main column */}

          {/* ── SIDEBAR ───────────────────────────────────────────────── */}
          <aside
            className="hidden xl:block w-[300px] shrink-0 space-y-8"
            aria-label="Sidebar"
          >
            {/* Table of Contents */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <TableOfContents
                content={article.content}
                contentSelector="#article-content"
              />
            </div>

            {/* AdSense sidebar */}
            <AdManager placement="sidebar" categorySlug={catSlug} toolSlug={slug} />

            {/* Related tools in sidebar */}
            {relatedTool && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Free Tool
                </p>
                <CTABox
                  tool={relatedTool}
                  categorySlug={(toolCategory as Category | null)?.slug ?? catSlug}
                  variant="compact"
                  className="my-0"
                />
              </div>
            )}

            {/* Latest articles */}
            {latestArticles.filter((a) => a.id !== article.id).length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Latest Articles
                </p>
                <ul className="space-y-3">
                  {latestArticles
                    .filter((a) => a.id !== article.id)
                    .slice(0, 4)
                    .map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/blog/${a.slug}`}
                          className="group flex gap-3 items-start"
                        >
                          <div
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: (a.category_id ? catMap.get(a.category_id)?.color : null) ?? '#3B82F6' }}
                            aria-hidden
                          />
                          <span className="text-xs text-gray-700 group-hover:text-blue-600 line-clamp-2 transition-colors leading-relaxed">
                            {a.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
                <Link
                  href="/blog"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:gap-1.5 transition-all"
                >
                  View all articles <ArrowRight size={11} aria-hidden />
                </Link>
              </div>
            )}

          </aside>

        </div>{/* end two-column */}
      </div>
    </>
  )
}
