import { notFound }    from 'next/navigation'
import type { Metadata } from 'next'
import Link              from 'next/link'
import { ArrowRight, BookOpen, Clock, CheckCircle } from 'lucide-react'

import { getAllTools, getToolBySlug, getRelatedTools } from '@/lib/db/tools'
import { getCategoryBySlug }                           from '@/lib/db/categories'
import { getArticlesByCategory }                       from '@/lib/db/articles'
import { getExampleOutputs }                           from '@/lib/db/examples'
import { generateToolMetadata }                        from '@/lib/seo/metadata'
import { toolPageSchema }                              from '@/lib/seo/schema'
import SchemaMarkup                                    from '@/components/seo/SchemaMarkup'
import Breadcrumb                                      from '@/components/seo/Breadcrumb'
import AdManager                                       from '@/components/ads/AdManager'
import TrustBadges                                     from '@/components/ui/TrustBadges'
import PrivacyNotice                                   from '@/components/ui/PrivacyNotice'
import Disclaimer                                      from '@/components/ui/Disclaimer'
import UsageCounter, { getTotalUsageCount }            from '@/components/ui/UsageCounter'
import ToolCard                                        from '@/components/tools/ToolCard'
import ToolInteractive                                 from '@/components/tools/ToolInteractive'
import FeedbackWidget                                  from '@/components/tools/FeedbackWidget'
import ExampleGallery                                  from '@/components/tools/ExampleGallery'

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const tools = await getAllTools()
  return tools
    .filter((t) => t.category?.slug)
    .map((t) => ({ category: t.category!.slug, slug: t.slug }))
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; slug: string }> }
): Promise<Metadata> {
  const { category: catSlug, slug } = await params
  const [tool, category] = await Promise.all([
    getToolBySlug(slug),
    getCategoryBySlug(catSlug),
  ])
  if (!tool || !category) return {}
  return generateToolMetadata(tool, category)
}

// ─── ISR — revalidate every 6 hours ──────────────────────────────────────────

export const revalidate = 21600

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ToolPage(
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  const { category: catSlug, slug } = await params

  // ── Data fetching — parallel where possible ──────────────────────────────
  const [tool, category] = await Promise.all([
    getToolBySlug(slug),
    getCategoryBySlug(catSlug),
  ])

  if (!tool || !category) notFound()

  // Secondary fetches after we have tool.id
  const [examples, articles, totalGenerates, allTools] = await Promise.all([
    getExampleOutputs(tool.id, 3),
    getArticlesByCategory(category.id, 3),
    getTotalUsageCount(),
    getAllTools(),
  ])

  // Related tools: use same-category siblings, exclude current
  const related = allTools
    .filter((t) => t.category_id === category.id && t.id !== tool.id)
    .slice(0, 3)

  const schemas = toolPageSchema(tool, category)

  return (
    <>
      <SchemaMarkup schemas={schemas} />

      {/* ── 1. AdSense Leaderboard — TOP ────────────────────────────────── */}
      <div className="flex justify-center bg-white border-b border-gray-100 py-3">
        <AdManager placement="top" categorySlug={catSlug} toolSlug={slug} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── 2. Breadcrumb ─────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: 'Home',         href: '/' },
            { label: 'Tools',        href: '/tools' },
            { label: category.name,  href: `/tools/${catSlug}` },
            { label: tool.name,      href: `/tools/${catSlug}/${slug}` },
          ]}
          className="mb-6"
        />

        {/* Two-column layout: main (left) + sidebar (right) */}
        <div className="flex gap-8 items-start">

          {/* ── MAIN COLUMN ─────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* ── 3. H1 ─────────────────────────────────────────────────── */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${category.color}15`,
                    borderColor:     `${category.color}30`,
                    color:           category.color ?? '#3B82F6',
                  }}
                >
                  <span aria-hidden>{category.icon}</span>
                  {category.name}
                </span>

                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} aria-hidden />
                  Free · Instant · No Sign Up
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                {tool.meta_title ?? tool.name}
              </h1>

              {/* ── 4. Tagline + trust badges ──────────────────────────── */}
              <p className="text-gray-600 leading-relaxed mb-5">
                {tool.description}
              </p>

              <TrustBadges layout="row" subset={3} compact className="mb-4" />

              {/* ── 5. Privacy notice ─────────────────────────────────── */}
              <PrivacyNotice />
            </header>

            {/* ── 6–10. Interactive: Form + Loading + Output + Feedback ── */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 mb-8">
              <ToolInteractive
                toolId={tool.id}
                toolName={tool.name}
                aiModel={tool.ai_model}
                formFields={tool.form_fields ?? []}
                categorySlug={catSlug}
              />

              {/* ── 9. Feedback (rendered after output inside interactive,
                       but we also show a persistent one below) ─────────── */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <FeedbackWidget toolId={tool.id} />
              </div>
            </div>

            {/* ── 12. Usage counter ─────────────────────────────────────── */}
            <UsageCounter count={totalGenerates} className="mb-6" />

            {/* ── 13. AdSense Rectangle — BELOW OUTPUT ──────────────────── */}
            <div className="flex justify-center mb-10">
              <AdManager placement="below-output" categorySlug={catSlug} toolSlug={slug} />
            </div>

            {/* ── 14. How It Works ──────────────────────────────────────── */}
            {tool.how_it_works?.length > 0 && (
              <section aria-labelledby="how-heading" className="mb-10">
                <h2 id="how-heading" className="text-xl font-bold text-gray-900 mb-5">
                  How to Use {tool.name}
                </h2>
                <ol className="space-y-3">
                  {tool.how_it_works.map((step, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* ── 15. Example gallery ───────────────────────────────────── */}
            <ExampleGallery
              examples={examples}
              toolName={tool.name}
              className="mb-10"
            />

            {/* ── 16. SEO content section (rich description from DB) ──────── */}
            {tool.description && (
              <section aria-labelledby="about-heading" className="mb-8">
                <h2 id="about-heading" className="text-xl font-bold text-gray-900 mb-4">
                  About {tool.name}
                </h2>
                <div className="prose prose-sm prose-gray max-w-none text-gray-600">
                  <p>
                    {tool.name} is a free AI-powered tool designed for US businesses and
                    professionals. Generate {tool.primary_keyword ?? tool.name.toLowerCase()} in
                    seconds — no templates to fill, no lawyer or specialist required.
                  </p>
                  <p>
                    Our AI uses advanced language models trained on thousands of US{' '}
                    {category.name.toLowerCase()} to produce output that matches
                    professional standards. All outputs reference United States law and
                    conventions.
                  </p>
                  <ul>
                    {tool.secondary_keywords?.slice(0, 4).map((kw) => (
                      <li key={kw} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500 shrink-0" aria-hidden />
                        {kw}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* ── 17. AdSense InArticle — MID CONTENT ───────────────────── */}
            <div className="my-8">
              <AdManager placement="in-article" categorySlug={catSlug} toolSlug={slug} />
            </div>

            {/* ── 18. Disclaimer ────────────────────────────────────────── */}
            <Disclaimer categorySlug={catSlug} className="mb-8" />

            {/* ── 19. FAQ ───────────────────────────────────────────────── */}
            {tool.faq?.length > 0 && (
              <section aria-labelledby="faq-heading" className="mb-10">
                <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <dl className="space-y-3">
                  {tool.faq.map(({ q, a }, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-gray-100 bg-white"
                      {...(i === 0 ? { open: true } : {})}
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-gray-900 list-none marker:hidden">
                        <dt>{q}</dt>
                        <svg
                          className="shrink-0 w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform"
                          viewBox="0 0 16 16" fill="currentColor" aria-hidden
                        >
                          <path d="M4.5 6.5L8 10l3.5-3.5H4.5z" />
                        </svg>
                      </summary>
                      <dd className="px-5 pb-4 pt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                        {a}
                      </dd>
                    </details>
                  ))}
                </dl>
              </section>
            )}

            {/* ── 20. Related tools ─────────────────────────────────────── */}
            {related.length > 0 && (
              <section aria-labelledby="related-heading" className="mb-10">
                <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-5">
                  Related Free AI Tools
                </h2>
                <ul className="grid gap-4 sm:grid-cols-3" role="list">
                  {related.map((t) => (
                    <li key={t.id}>
                      <ToolCard tool={t} categorySlug={catSlug} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── 21. Recent blog articles ──────────────────────────────── */}
            {articles.length > 0 && (
              <section aria-labelledby="articles-heading" className="mb-10">
                <h2 id="articles-heading" className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BookOpen size={18} className="text-gray-400" aria-hidden />
                  {category.name} Guides & Resources
                </h2>
                <ul className="grid gap-4 sm:grid-cols-3" role="list">
                  {articles.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/blog/${article.slug}`}
                        className="group flex flex-col h-full rounded-xl border border-gray-100 bg-white p-5 hover:shadow-md transition-all"
                      >
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 mb-2 line-clamp-2 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-3 flex-1">
                          {article.meta_description}
                        </p>
                        <span className="mt-3 text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          Read guide <ArrowRight size={11} aria-hidden />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── 22. AdSense Leaderboard — BOTTOM ──────────────────────── */}
            <div className="flex justify-center mt-6">
              <AdManager placement="bottom" categorySlug={catSlug} toolSlug={slug} />
            </div>

          </div>{/* end main column */}

          {/* ── SIDEBAR COLUMN ──────────────────────────────────────────── */}
          {/* ── 11. AdSense Sidebar — sticky beside output ────────────── */}
          <aside className="hidden xl:block w-[300px] shrink-0" aria-label="Advertisements">
            <AdManager placement="sidebar" categorySlug={catSlug} toolSlug={slug} />
          </aside>

        </div>{/* end two-column grid */}
      </div>
    </>
  )
}
