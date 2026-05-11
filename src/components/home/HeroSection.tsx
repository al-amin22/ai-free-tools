import Link from 'next/link'
import { ArrowRight, FileText, Zap, Users } from 'lucide-react'

interface HeroSectionProps {
  totalTools:    number
  totalGenerates: number
}

export default function HeroSection({ totalTools, totalGenerates }: HeroSectionProps) {
  function fmt(n: number) {
    return n >= 1000 ? `${Math.floor(n / 1000)}k` : n.toString()
  }

  const stats = [
    { icon: <Zap size={14} />,       value: `${totalTools}+`,         label: 'Free AI Tools' },
    { icon: <FileText size={14} />,  value: `${fmt(totalGenerates)}+`, label: 'Documents Created' },
    { icon: <Users size={14} />,     value: '50k+',                    label: 'US Professionals' },
  ]

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-4 py-20 sm:py-28 text-white"
      aria-labelledby="hero-heading"
    >
      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/5" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
          <Zap size={13} className="text-yellow-300" aria-hidden />
          <span>100% Free · No Sign Up · AI Powered</span>
        </div>

        {/* H1 */}
        <h1
          id="hero-heading"
          className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Free AI Tools for{' '}
          <span className="text-yellow-300">US Businesses</span>{' '}
          &amp; Professionals
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-blue-100 leading-relaxed">
          Generate legal documents, real estate forms, HR templates, financial reports,
          and marketing copy instantly — built for the United States, 100% free.
        </p>

        {/* Search bar */}
        <form
          action="/search"
          method="GET"
          role="search"
          className="mt-8 flex max-w-xl mx-auto"
        >
          <label htmlFor="hero-search" className="sr-only">Search free AI tools</label>
          <div className="relative flex w-full rounded-xl shadow-lg overflow-hidden">
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Search 65 free AI tools… e.g. NDA, lease agreement"
              className="flex-1 border-0 bg-white px-5 py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 transition-colors px-6 text-sm font-semibold text-gray-900 shrink-0 flex items-center gap-2"
            >
              Search
              <ArrowRight size={15} aria-hidden />
            </button>
          </div>
        </form>

        {/* Quick links */}
        <p className="mt-4 text-sm text-blue-200">
          Popular:&nbsp;
          {[
            { label: 'NDA Generator', href: '/tools/legal-documents/nda-generator' },
            { label: 'Lease Agreement', href: '/tools/real-estate/lease-agreement' },
            { label: 'Invoice Generator', href: '/tools/finance-tax/invoice-generator' },
          ].map((link, i) => (
            <span key={link.href}>
              {i > 0 && <span className="mx-1 text-blue-400">·</span>}
              <Link href={link.href} className="underline underline-offset-2 hover:text-white transition-colors">
                {link.label}
              </Link>
            </span>
          ))}
        </p>

        {/* Trust stats */}
        <dl className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <dt className="flex items-center justify-center gap-1.5 text-xs text-blue-200 mb-1">
                {s.icon}
                {s.label}
              </dt>
              <dd className="text-2xl font-extrabold text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
