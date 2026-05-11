import { notFound }     from 'next/navigation'
import type { Metadata } from 'next'
import Link              from 'next/link'
import { MapPin, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

import { getAllStatePages, getStatePageContent, getStatePagesByTool } from '@/lib/db/state-pages'
import { getToolBySlug }             from '@/lib/db/tools'
import { getCategoryBySlug }         from '@/lib/db/categories'
import { getExampleOutputs }         from '@/lib/db/examples'
import { getTotalUsageCount }        from '@/components/ui/UsageCounter'
import { generateStateMetadata }     from '@/lib/seo/metadata'
import { statePageSchema }           from '@/lib/seo/schema'
import { STATE_BY_SLUG, STATE_BY_CODE } from '@/lib/data/us-states'
import { getStateLaws, getLawSectionForTool } from '@/lib/data/state-laws'
import SchemaMarkup    from '@/components/seo/SchemaMarkup'
import Breadcrumb      from '@/components/seo/Breadcrumb'
import AdManager       from '@/components/ads/AdManager'
import TrustBadges     from '@/components/ui/TrustBadges'
import PrivacyNotice   from '@/components/ui/PrivacyNotice'
import UsageCounter    from '@/components/ui/UsageCounter'
import ToolInteractive from '@/components/tools/ToolInteractive'
import ExampleGallery  from '@/components/tools/ExampleGallery'
import FeedbackWidget  from '@/components/tools/FeedbackWidget'

// ─── ISR ─────────────────────────────────────────────────────────────────────

export const revalidate    = 86400  // 24 h — state law content changes rarely
export const dynamicParams = true   // Render valid states not yet in DB on demand

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const pages = await getAllStatePages()
  return pages.map((sp) => ({
    category: (sp.tool.category as { slug: string }).slug,
    slug:     sp.tool.slug,
    state:    sp.state_name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; slug: string; state: string }> }
): Promise<Metadata> {
  const { category: catSlug, slug, state: stateSlug } = await params

  const stateInfo = STATE_BY_SLUG.get(stateSlug)
  if (!stateInfo) return {}

  const [tool, category] = await Promise.all([
    getToolBySlug(slug),
    getCategoryBySlug(catSlug),
  ])
  if (!tool || !category) return {}

  const statePage = await getStatePageContent(tool.id, stateSlug)

  return generateStateMetadata(
    tool,
    category,
    stateInfo.name,
    stateInfo.code,
    statePage?.meta_title,
    statePage?.meta_description,
  )
}

// ─── State FAQ generator ──────────────────────────────────────────────────────

function buildStateFaqs(
  toolName:  string,
  toolSlug:  string,
  stateName: string,
  stateCode: string,
): Array<{ q: string; a: string }> {
  const laws      = getStateLaws(stateCode)
  const section   = getLawSectionForTool(toolSlug)
  const isLease   = section === 'lease'
  const isEvict   = section === 'eviction'
  const isNCA     = section === 'nonCompete'
  const isLLC     = section === 'llc'
  const isPropMgr = section === 'propertyMgmt'

  const generic: Array<{ q: string; a: string }> = [
    {
      q: `Is this ${toolName} valid in ${stateName}?`,
      a: `Yes. The AI generates output referencing ${stateName} state law${laws ? ` (${laws[section as keyof typeof laws] ? (laws[section as keyof typeof laws] as { govLaw?: string }).govLaw ?? '' : ''})` : ''}. You should always have legal documents reviewed by a licensed ${stateName} attorney before signing.`,
    },
    {
      q: `Is this ${toolName} generator free?`,
      a: `Completely free. No account, no credit card, no limits. You can generate, copy, download, and print your ${toolName} instantly.`,
    },
    {
      q: `How do I use this ${toolName} for ${stateName}?`,
      a: `Fill in the form above with your specific details. The AI uses ${stateName} state law requirements to generate a customized ${toolName} in seconds. Review it carefully and consult an attorney if needed.`,
    },
  ]

  if (isLease && laws?.lease) {
    return [
      {
        q: `What is the maximum security deposit for a lease in ${stateName}?`,
        a: `${stateName} law limits security deposits to ${laws.lease.depositLimit}. Landlords must return the deposit within ${laws.lease.depositReturn}.`,
      },
      {
        q: `How much notice is required for non-payment of rent in ${stateName}?`,
        a: `Under ${laws.lease.govLaw}, a landlord must serve a ${laws.lease.noticeNonpayment} before proceeding with eviction for non-payment.`,
      },
      {
        q: `Does ${stateName} have rent control?`,
        a: laws.lease.rentControl,
      },
      {
        q: `How much notice do I need to terminate a month-to-month lease in ${stateName}?`,
        a: `${stateName} requires ${laws.lease.noticeTermination} for terminating a month-to-month tenancy.`,
      },
      ...generic,
    ]
  }

  if (isEvict && laws?.eviction) {
    return [
      {
        q: `How many days notice is required for non-payment eviction in ${stateName}?`,
        a: `In ${stateName}, a landlord must give ${laws.eviction.noticeNonpay} written notice before filing for eviction for non-payment of rent.`,
      },
      {
        q: `What is the eviction process in ${stateName}?`,
        a: `Under ${laws.eviction.govLaw}, a landlord must first deliver the proper written notice, wait the required period, then file in court if the tenant does not comply. ${laws.eviction.selfHelp}.`,
      },
      {
        q: `Can a landlord evict a tenant without notice in ${stateName}?`,
        a: `No. ${stateName} law requires proper written notice before any eviction proceeding. Self-help eviction (changing locks, removing belongings) is illegal in ${stateName}.`,
      },
      {
        q: `What notice is required to end a month-to-month tenancy in ${stateName}?`,
        a: `A ${laws.eviction.noticeMToM} written notice is required to terminate a month-to-month tenancy in ${stateName}.`,
      },
      ...generic,
    ]
  }

  if (isNCA && laws?.nonCompete) {
    return [
      {
        q: `Are non-compete agreements enforceable in ${stateName}?`,
        a: `${laws.nonCompete.summary}`,
      },
      {
        q: `How long can a non-compete last in ${stateName}?`,
        a: `In ${stateName}, ${laws.nonCompete.maxDuration}. Courts look at whether the duration is reasonable for the employer's legitimate business interests.`,
      },
      {
        q: `What makes a non-compete enforceable in ${stateName}?`,
        a: `Under ${laws.nonCompete.govLaw}: ${laws.nonCompete.keyRestriction}.`,
      },
      {
        q: `Can an employer enforce a non-compete if I live in ${stateName}?`,
        a: `It depends on the specifics. ${stateName} courts apply the ${laws.nonCompete.govLaw} standard. Consult a ${stateName} employment attorney to evaluate your specific agreement.`,
      },
      ...generic,
    ]
  }

  if (isLLC && laws?.llc) {
    return [
      {
        q: `How much does it cost to form an LLC in ${stateName}?`,
        a: `The ${stateName} state filing fee is ${laws.llc.filingFee}. There may also be ongoing fees: ${laws.llc.annualFee}.`,
      },
      {
        q: `Does ${stateName} require an LLC Operating Agreement?`,
        a: `While ${stateName} may not always mandate a written operating agreement, it is strongly recommended for all LLCs. The ${laws.llc.govLaw} governs LLCs in ${stateName}.`,
      },
      {
        q: `What are the annual requirements for an LLC in ${stateName}?`,
        a: `${stateName} LLCs must file: ${laws.llc.annualReport}. Failure to file may result in administrative dissolution.`,
      },
      {
        q: `How long does it take to form an LLC in ${stateName}?`,
        a: `Standard processing time in ${stateName} is ${laws.llc.processingTime}.`,
      },
      ...generic,
    ]
  }

  if (isPropMgr && laws?.propertyMgmt) {
    return [
      {
        q: `Do property managers need a license in ${stateName}?`,
        a: `${laws.propertyMgmt.licenseRequired ? `Yes. ${stateName} requires a ${laws.propertyMgmt.licenseType} to manage properties for compensation.` : `${stateName} does not require a state real estate license for property management in all cases, but local regulations may apply.`} The governing body is ${laws.propertyMgmt.govBody}.`,
      },
      {
        q: `Are trust accounts required for property managers in ${stateName}?`,
        a: `${laws.propertyMgmt.trustAccount}.`,
      },
      {
        q: `What must a ${stateName} Property Management Agreement include?`,
        a: `A ${stateName} property management agreement should define the scope of services, compensation, owner and manager duties, termination terms, and trust account handling. It must comply with ${laws.propertyMgmt.govBody} regulations.`,
      },
      ...generic,
    ]
  }

  // Generic fallback when no state law data available
  return [
    {
      q: `Is this ${toolName} valid in ${stateName}?`,
      a: `The generated ${toolName} is designed to comply with ${stateName} requirements. Always review with a licensed ${stateName} attorney before use.`,
    },
    {
      q: `Is this tool free to use?`,
      a: `Yes — completely free. No account required. Generate, download, and print at no cost.`,
    },
    {
      q: `Can I customize the generated ${toolName}?`,
      a: `Yes. You can copy the output and edit it to match your specific situation. Consider having a ${stateName} attorney review the final document.`,
    },
    {
      q: `How is this ${toolName} specific to ${stateName}?`,
      a: `Our AI uses ${stateName} state law requirements to generate ${toolName.toLowerCase()}s that reference the correct statutes, notice periods, and legal standards applicable in ${stateName}.`,
    },
    {
      q: `Do I need a lawyer to use this ${toolName} in ${stateName}?`,
      a: `You don't need a lawyer to generate the document, but for legally binding agreements in ${stateName} we recommend having an attorney review before signing — especially for high-stakes documents.`,
    },
  ]
}

// ─── State-specific law card ──────────────────────────────────────────────────

function LawHighlightCard({
  title,
  items,
  stateCode,
}: {
  title:     string
  items:     string[]
  stateCode: string
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={15} className="text-blue-500 shrink-0" aria-hidden />
        <h3 className="text-sm font-bold text-blue-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
            <CheckCircle size={13} className="mt-0.5 shrink-0 text-blue-400" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── State disclaimer ─────────────────────────────────────────────────────────

function StateDisclaimer({
  stateName,
  categorySlug,
  lawRef,
}: {
  stateName:    string
  categorySlug: string
  lawRef?:      string
}) {
  const categoryNote = categorySlug === 'legal-documents' || categorySlug === 'real-estate'
    ? `${stateName} legal documents`
    : `${stateName} documents`

  return (
    <aside
      role="note"
      aria-label={`${stateName} disclaimer`}
      className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 mb-8"
    >
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" aria-hidden />
      <div className="text-xs text-amber-800 leading-relaxed">
        <p className="font-semibold mb-1">{stateName} Legal Disclaimer</p>
        <p>
          This tool generates {categoryNote} for reference purposes only. {stateName} laws change
          frequently{lawRef ? ` (currently governed by ${lawRef})` : ''}.
          Always consult a licensed {stateName} attorney before signing or relying on any legal document.
          The output should not be used as a substitute for professional legal advice.
        </p>
      </div>
    </aside>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StateToolPage(
  { params }: { params: Promise<{ category: string; slug: string; state: string }> }
) {
  const { category: catSlug, slug, state: stateSlug } = await params

  // Validate state slug
  const stateInfo = STATE_BY_SLUG.get(stateSlug)
  if (!stateInfo) notFound()

  const [tool, category] = await Promise.all([
    getToolBySlug(slug),
    getCategoryBySlug(catSlug),
  ])
  if (!tool || !category) notFound()

  const [statePage, examples, otherStatePages, totalGenerates] = await Promise.all([
    getStatePageContent(tool.id, stateSlug),
    getExampleOutputs(tool.id, 2),
    getStatePagesByTool(tool.id),
    getTotalUsageCount(),
  ])

  const laws        = getStateLaws(stateInfo.code)
  const lawSection  = getLawSectionForTool(slug)
  const lawData     = laws?.[lawSection as keyof typeof laws] as Record<string, string> | undefined
  const faqs        = buildStateFaqs(tool.name, slug, stateInfo.name, stateInfo.code)
  const schemas     = statePageSchema(tool, category, stateInfo.name, stateSlug, faqs)

  // Build law highlight bullets from profile
  const lawBullets: string[] = lawData
    ? Object.values(lawData).filter((v): v is string => typeof v === 'string' && v.length > 10)
    : []

  // Other state links (same tool, different states)
  const otherStates = otherStatePages.filter((sp) => sp.state_code !== stateInfo.code)

  const parentUrl  = `/tools/${catSlug}/${slug}`
  const currentUrl = `${parentUrl}/${stateSlug}`

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
            { label: 'Home',         href: '/' },
            { label: 'Tools',        href: '/tools' },
            { label: category.name,  href: `/tools/${catSlug}` },
            { label: tool.name,      href: parentUrl },
            { label: stateInfo.name, href: currentUrl },
          ]}
          className="mb-6"
        />

        {/* Two-column layout */}
        <div className="flex gap-8 items-start">

          {/* ── MAIN COLUMN ───────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">

            {/* ── Header ────────────────────────────────────────────── */}
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

                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <MapPin size={11} aria-hidden />
                  {stateInfo.name}
                </span>

                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} aria-hidden />
                  Free · Instant · No Sign Up
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
                {statePage?.meta_title
                  ? statePage.meta_title.replace(/\s*[|—]\s*.*$/, '')
                  : `Free ${tool.name} for ${stateInfo.name} — AI Powered`}
              </h1>

              <p className="text-gray-600 leading-relaxed mb-5">
                {statePage?.meta_description
                  ?? `Generate a ${tool.name.toLowerCase()} specific to ${stateInfo.name} instantly. Our AI references ${stateInfo.name} state law so your document meets local requirements — no templates, no lawyer fees.`}
              </p>

              <TrustBadges layout="row" subset={3} compact className="mb-4" />
              <PrivacyNotice />
            </header>

            {/* ── Tool form ─────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 mb-8">
              <ToolInteractive
                toolId={tool.id}
                toolName={`${tool.name} (${stateInfo.name})`}
                aiModel={tool.ai_model}
                formFields={tool.form_fields ?? []}
                categorySlug={catSlug}
              />
              <div className="mt-4 pt-4 border-t border-gray-200">
                <FeedbackWidget toolId={tool.id} />
              </div>
            </div>

            {/* ── Usage counter ─────────────────────────────────────── */}
            <UsageCounter count={totalGenerates} className="mb-6" />

            {/* ── AdSense below output ──────────────────────────────── */}
            <div className="flex justify-center mb-10">
              <AdManager placement="below-output" categorySlug={catSlug} toolSlug={slug} />
            </div>

            {/* ── State law highlights ──────────────────────────────── */}
            {lawBullets.length > 0 && (
              <section aria-labelledby="state-laws-heading" className="mb-10">
                <h2 id="state-laws-heading" className="text-xl font-bold text-gray-900 mb-4">
                  {tool.name} Laws in {stateInfo.name}
                </h2>
                <LawHighlightCard
                  title={`Key ${stateInfo.name} Requirements`}
                  items={lawBullets.slice(0, 5)}
                  stateCode={stateInfo.code}
                />
                {statePage?.content && (
                  <div
                    className="prose prose-sm prose-gray max-w-none text-gray-600"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: statePage.content }}
                  />
                )}
              </section>
            )}

            {/* ── About section ────────────────────────────────────── */}
            <section aria-labelledby="about-state-heading" className="mb-8">
              <h2 id="about-state-heading" className="text-xl font-bold text-gray-900 mb-4">
                About This {tool.name} Generator for {stateInfo.name}
              </h2>
              <div className="prose prose-sm prose-gray max-w-none text-gray-600">
                <p>
                  This free AI-powered tool generates {tool.name.toLowerCase()}s that comply
                  with {stateInfo.name} state law. Unlike generic templates, our AI incorporates
                  {stateInfo.name}-specific requirements including notice periods, deposit limits,
                  and statutory references to help protect both parties.
                </p>
                <p>
                  {stateInfo.name} is one of the most active markets in the United States for{' '}
                  {category.name.toLowerCase()}. Whether you&apos;re a landlord, business owner,
                  or professional in {stateInfo.name}, having the correct documentation is essential.
                </p>
                <ul>
                  {[
                    `References ${stateInfo.name} state statutes and regulations`,
                    `Includes ${stateInfo.name}-specific notice periods and requirements`,
                    `AI-generated in seconds — no generic templates`,
                    `Free to use, download, and print`,
                    `No account or sign-up required`,
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500 shrink-0" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── AdSense mid-content ───────────────────────────────── */}
            <div className="my-8">
              <AdManager placement="in-article" categorySlug={catSlug} toolSlug={slug} />
            </div>

            {/* ── State disclaimer ──────────────────────────────────── */}
            <StateDisclaimer
              stateName={stateInfo.name}
              categorySlug={catSlug}
              lawRef={lawData?.['govLaw']}
            />

            {/* ── Examples ─────────────────────────────────────────── */}
            <ExampleGallery
              examples={examples}
              toolName={`${tool.name} (${stateInfo.name})`}
              className="mb-10"
            />

            {/* ── FAQ ──────────────────────────────────────────────── */}
            {faqs.length > 0 && (
              <section aria-labelledby="faq-heading" className="mb-10">
                <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 mb-6">
                  {stateInfo.name} {tool.name} — Frequently Asked Questions
                </h2>
                <dl className="space-y-3">
                  {faqs.map(({ q, a }, i) => (
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

            {/* ── State nav — link to main tool page ───────────────── */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 mb-8 text-sm">
              <p className="text-gray-500 mb-2">
                Looking for a generic US version?{' '}
                <Link href={parentUrl} className="text-blue-600 hover:underline font-medium">
                  View the main {tool.name} generator →
                </Link>
              </p>
            </div>

            {/* ── AdSense bottom ────────────────────────────────────── */}
            <div className="flex justify-center mt-6">
              <AdManager placement="bottom" categorySlug={catSlug} toolSlug={slug} />
            </div>

          </div>{/* end main column */}

          {/* ── SIDEBAR ───────────────────────────────────────────────── */}
          <aside className="hidden xl:block w-[300px] shrink-0" aria-label="Sidebar">

            {/* AdSense sidebar */}
            <AdManager placement="sidebar" categorySlug={catSlug} toolSlug={slug} />

            {/* Other states nav */}
            {otherStates.length > 0 && (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                  Other States
                </p>
                <ul className="space-y-2">
                  {otherStates.slice(0, 10).map((sp) => {
                    const si = STATE_BY_CODE.get(sp.state_code)
                    if (!si) return null
                    return (
                      <li key={sp.state_code}>
                        <Link
                          href={`${parentUrl}/${si.slug}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <MapPin size={12} className="text-gray-300" aria-hidden />
                          {sp.state_name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  href={parentUrl}
                  className="mt-3 block text-xs text-center text-blue-600 hover:underline"
                >
                  View all states →
                </Link>
              </div>
            )}

          </aside>

        </div>{/* end two-column */}
      </div>
    </>
  )
}
