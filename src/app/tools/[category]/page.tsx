import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

import { getAllCategories, getCategoryBySlug } from '@/lib/db/categories'
import { getToolsByCategory }                  from '@/lib/db/tools'
import { getArticlesByCategory }               from '@/lib/db/articles'
import { generateCategoryMetadata }            from '@/lib/seo/metadata'
import { categorySchema }                      from '@/lib/seo/schema'
import SchemaMarkup                            from '@/components/seo/SchemaMarkup'
import Breadcrumb                              from '@/components/seo/Breadcrumb'
import ToolCard                                from '@/components/tools/ToolCard'
import AdManager                               from '@/components/ads/AdManager'

// ─── Static params — built at build time from all categories in DB ────────────

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((cat) => ({ category: cat.slug }))
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return generateCategoryMetadata(category)
}

// ─── Revalidate every 12 hours ────────────────────────────────────────────────

export const revalidate = 43200

// ─── Category-specific FAQ (SEO-rich, no DB column needed) ───────────────────

const CATEGORY_FAQ: Record<string, Array<{ q: string; a: string }>> = {
  'legal-documents': [
    { q: 'Are these AI-generated legal documents valid in the United States?',
      a: 'AI-generated documents can serve as solid templates and starting points, but they should be reviewed by a licensed US attorney before signing. Laws vary by state, so professional review ensures your document meets local requirements.' },
    { q: 'Is it free to generate legal documents with AI?',
      a: 'Yes — all legal document tools on this site are 100% free with no sign up required. You can generate NDAs, lease agreements, contracts, and more at no cost.' },
    { q: 'Which states are your legal document templates designed for?',
      a: 'Templates reference US federal law and include common provisions. You can specify your state in the form and the AI will incorporate relevant state-specific language.' },
    { q: 'How long does it take to generate a legal document?',
      a: 'Most legal documents are generated in 10–30 seconds. Longer documents like business contracts may take up to 45 seconds.' },
    { q: 'Can I edit the generated document after downloading?',
      a: 'Absolutely. Download as .docx and edit in Microsoft Word or Google Docs. We recommend reviewing and customizing to your specific situation.' },
    { q: 'Do you store the information I enter into the forms?',
      a: 'No. Your inputs are processed in real-time to generate the document and immediately discarded. We do not store, sell, or share any of your information.' },
    { q: 'What types of legal documents can I generate?',
      a: 'Our legal tools cover NDAs, lease agreements, independent contractor agreements, terms of service, privacy policies, demand letters, bill of sale, and more.' },
  ],
  'real-estate': [
    { q: 'Can I use AI-generated real estate documents in any US state?',
      a: 'Templates are designed for general US use. Real estate laws and disclosure requirements vary by state — always have documents reviewed by a licensed real estate attorney or agent in your state.' },
    { q: 'Is the AI lease agreement generator free?',
      a: 'Yes, completely free. No sign up, no credit card, no subscription. Generate a residential or commercial lease agreement instantly.' },
    { q: 'What real estate documents can I generate?',
      a: 'We offer lease agreements, rental applications, notice to vacate, property listing descriptions, offer letters, rent increase notices, and landlord letters.' },
    { q: 'How accurate are AI-generated property listing descriptions?',
      a: 'The AI creates professional, compelling descriptions from your inputs. Review and adjust any specific details before publishing your listing.' },
    { q: 'Do I need a real estate agent to use these tools?',
      a: 'No. These tools are designed for FSBO sellers, landlords, tenants, and real estate professionals alike.' },
    { q: 'Can landlords use these tools to manage multiple properties?',
      a: 'Yes. There are no usage limits for document generation. Landlords can generate lease agreements, notices, and letters for all their properties.' },
    { q: 'Are these tools compliant with the Fair Housing Act?',
      a: 'Templates are designed to be Fair Housing Act compliant. Always review listings and communications to ensure they do not contain discriminatory language.' },
  ],
  'hr-recruitment': [
    { q: 'Are AI-generated job descriptions compliant with US employment law?',
      a: 'Templates follow EEO guidelines and avoid discriminatory language. For sensitive roles, have documents reviewed by an HR professional or employment attorney.' },
    { q: 'Can I use AI to write offer letters?',
      a: 'Yes. Our offer letter generator creates professional, customizable offer letters with standard US employment terms in seconds.' },
    { q: 'What HR documents can I generate for free?',
      a: 'Job descriptions, offer letters, rejection letters, termination letters, performance improvement plans, employee handbooks sections, and more.' },
    { q: 'Is there a limit on how many job descriptions I can generate?',
      a: 'Free users can generate 5 documents per hour. That is enough for most hiring needs. Sign up free for 20 per hour.' },
    { q: 'Can I use these HR tools for hourly and salaried employees?',
      a: 'Yes. Specify the employment type in the form and the AI generates appropriate language for hourly, salaried, exempt, and non-exempt positions.' },
    { q: 'Are performance review templates included?',
      a: 'Yes. We offer performance review templates, self-evaluation forms, 360-degree feedback frameworks, and performance improvement plan templates.' },
    { q: 'How do I customize AI-generated HR documents for my company?',
      a: 'Enter your company name, role details, and specific requirements in the form. Download as .docx and add your logo and final touches before sending.' },
  ],
  'finance-tax': [
    { q: 'Are AI-generated invoices legally valid in the United States?',
      a: 'Yes. Our invoices include all standard required fields. For specific compliance needs (sales tax collection, etc.), consult a CPA.' },
    { q: 'Can these tools help with IRS correspondence?',
      a: 'Yes. We offer IRS response letter generators, CP2000 response templates, and audit support letter generators based on common IRS notices.' },
    { q: 'Do you provide tax advice?',
      a: 'No. These tools provide general financial document templates. Always consult a licensed CPA or tax professional for tax advice specific to your situation.' },
    { q: 'What financial documents can I generate for free?',
      a: 'Invoices, payment receipts, profit & loss statements, budget plans, financial summaries, IRS response letters, W-9 instructions, and expense reports.' },
    { q: 'Are these tools suitable for freelancers and small businesses?',
      a: 'Absolutely. They are especially popular with freelancers, consultants, and small business owners who need professional financial documents quickly.' },
    { q: 'Can I generate invoices in a specific format like Net-30?',
      a: 'Yes. Specify payment terms (Net-15, Net-30, Net-60, due on receipt) in the form and the invoice will reflect your preferred terms.' },
    { q: 'Do the financial tools handle USD currency only?',
      a: 'Primary focus is USD for US-based transactions. International invoicing in other currencies is supported — specify the currency in the form.' },
  ],
  'small-business': [
    { q: 'Can AI write a business plan that I can use for a bank loan?',
      a: 'Our business plan generator creates a comprehensive document covering executive summary, market analysis, financial projections, and operational plan. Lenders typically want reviewed, accurate financial projections — work with an accountant to finalize numbers.' },
    { q: 'What small business documents can I generate?',
      a: 'Business plans, partnership agreements, vendor contracts, non-compete agreements, business proposal templates, SOPs, mission statements, and more.' },
    { q: 'Are vendor contracts legally binding?',
      a: 'A signed contract between two parties is legally binding if it meets contract formation requirements. Always have significant contracts reviewed by a business attorney.' },
    { q: 'Can I generate an LLC operating agreement?',
      a: 'Yes. Our LLC operating agreement generator creates single-member and multi-member agreements with standard provisions for US LLCs.' },
    { q: 'Is this suitable for startups?',
      a: 'Yes. Startup founders use our tools for pitch decks outlines, founder agreements, equity vesting schedules, and investor update templates.' },
    { q: 'How long is a typical AI-generated business plan?',
      a: 'Standard business plans are 800–1,500 words covering all key sections. Use the "detailed" option for a longer, more comprehensive version.' },
    { q: 'Can these tools help with business registration documents?',
      a: 'We provide templates for articles of incorporation, bylaws, and operating agreements. Actual registration requires filing with your state — the documents help you prepare.' },
  ],
  'copywriting-content': [
    { q: 'Can I use AI-generated copy for commercial purposes?',
      a: 'Yes. Content generated by our tools is yours to use freely for commercial purposes including ads, websites, emails, and social media.' },
    { q: 'Will AI copywriting affect my Google SEO rankings?',
      a: 'Google\'s guidelines focus on helpful, high-quality content regardless of how it was created. Review and personalize AI content with your expertise and unique insights before publishing.' },
    { q: 'What types of copy can I generate?',
      a: 'Facebook and Google ads, email campaigns, product descriptions, blog post outlines, social media captions, landing page copy, taglines, press releases, and more.' },
    { q: 'Does the AI write in American English?',
      a: 'Yes. All content is generated in American English with US spelling, idioms, and cultural references appropriate for US audiences.' },
    { q: 'Can I generate content for specific industries?',
      a: 'Yes. Specify your industry, target audience, and tone in the form. The AI tailors the copy accordingly — real estate, legal, healthcare, e-commerce, SaaS, and more.' },
    { q: 'How many words can the AI generate at once?',
      a: 'Standard outputs are 150–500 words. Use the "long form" option for blog posts and articles up to 1,500 words.' },
    { q: 'Can I generate email sequences for marketing?',
      a: 'Yes. Our email campaign generator creates welcome sequences, drip campaigns, promotional emails, and cold outreach sequences tailored to your offer.' },
  ],
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: slug } = await params

  // Parallel fetches — fail fast on unknown category
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [tools, allCategories, articles] = await Promise.all([
    getToolsByCategory(slug),
    getAllCategories(),
    getArticlesByCategory(category.id, 3),
  ])

  const relatedCategories = allCategories.filter((c) => c.id !== category.id)
  const faqs = CATEGORY_FAQ[slug] ?? []

  // Top 3 tools flagged as "popular" (first 3 by sort_order)
  const popularIds = new Set(tools.slice(0, 3).map((t) => t.id))

  return (
    <>
      <SchemaMarkup schemas={categorySchema(category)} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── 1. Breadcrumb ─────────────────────────────────────────────── */}
        <Breadcrumb
          items={[
            { label: 'Home',  href: '/' },
            { label: 'Tools', href: '/tools' },
            { label: category.name, href: `/tools/${slug}` },
          ]}
          className="mb-6"
        />

        {/* ── 2. H1 + description ───────────────────────────────────────── */}
        <header className="mb-8 max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl leading-none" aria-hidden>{category.icon}</span>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: category.color ?? '#3B82F6' }}
            >
              {tools.length} Free Tools
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {category.meta_title ?? `Free AI ${category.name} Tools — United States`}
          </h1>

          <p className="text-gray-600 leading-relaxed text-base">
            {category.description}
          </p>
        </header>

        {/* ── 3. AdSense Leaderboard — top ──────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <AdManager placement="top" categorySlug={slug} toolSlug="category" />
        </div>

        {/* ── 4. Tools grid ─────────────────────────────────────────────── */}
        <section aria-labelledby="tools-heading">
          <h2 id="tools-heading" className="text-xl font-bold text-gray-900 mb-5">
            All {category.name} Tools ({tools.length})
          </h2>

          {tools.length === 0 ? (
            <p className="text-gray-500 py-12 text-center">
              Tools for this category are coming soon. Check back shortly.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <ToolCard
                    tool={tool}
                    categorySlug={slug}
                    priority={popularIds.has(tool.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── 5. AdSense Rectangle — mid ────────────────────────────────── */}
        <div className="flex justify-center my-10">
          <AdManager placement="mid" categorySlug={slug} toolSlug="category" />
        </div>

        {/* ── 6. FAQ Section ────────────────────────────────────────────── */}
        {faqs.length > 0 && (
          <section aria-labelledby="faq-heading" className="my-10 max-w-3xl">
            <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions — {category.name}
            </h2>

            <dl className="space-y-3">
              {faqs.map(({ q, a }, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-gray-100 bg-white"
                  {...(i === 0 ? { open: true } : {})}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-gray-900 marker:hidden list-none">
                    <dt>{q}</dt>
                    <svg
                      className="shrink-0 w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform"
                      viewBox="0 0 16 16" fill="currentColor" aria-hidden
                    >
                      <path d="M4.5 6.5L8 10l3.5-3.5H4.5z" />
                    </svg>
                  </summary>
                  <dd className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {a}
                  </dd>
                </details>
              ))}
            </dl>
          </section>
        )}

        {/* ── 7. Related categories ─────────────────────────────────────── */}
        {relatedCategories.length > 0 && (
          <section aria-labelledby="related-heading" className="my-10">
            <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-5">
              Explore Other Free AI Tool Categories
            </h2>

            <ul className="flex flex-wrap gap-3" role="list">
              {relatedCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/tools/${cat.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    <span aria-hidden>{cat.icon}</span>
                    {cat.name}
                    <ArrowRight size={13} className="text-gray-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 8. Recent blog articles ───────────────────────────────────── */}
        {articles.length > 0 && (
          <section aria-labelledby="articles-heading" className="my-10">
            <h2 id="articles-heading" className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
              <BookOpen size={18} className="text-gray-400" aria-hidden />
              Recent {category.name} Guides
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
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">
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

        {/* ── 9. AdSense Leaderboard — bottom ──────────────────────────── */}
        <div className="flex justify-center mt-10">
          <AdManager placement="bottom" categorySlug={slug} toolSlug="category" />
        </div>

      </div>
    </>
  )
}
