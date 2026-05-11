import Link from 'next/link'
import { Zap } from 'lucide-react'
import { getAllCategories } from '@/lib/db/categories'
import { getFeaturedTools } from '@/lib/db/tools'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'
const YEAR      = new Date().getFullYear()

export default async function Footer() {
  const [categories, featured] = await Promise.all([
    getAllCategories(),
    getFeaturedTools(6),
  ])

  const totalTools = 65

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label={`${SITE_NAME} home`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Zap size={16} className="text-white" aria-hidden />
              </span>
              <span className="text-base font-bold text-gray-900">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {totalTools} free AI-powered tools built for the United States.
              No sign up, no fees — ever.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/tools/${cat.slug}`}
                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span aria-hidden className="text-xs">{cat.icon}</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2">
              {featured.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.category?.slug ?? 'tools'}/${tool.slug}`}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors line-clamp-1"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/blog',    label: 'Blog' },
                { href: '/about',   label: 'About' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms',   label: 'Terms of Service' },
                { href: '/sitemap.xml', label: 'Sitemap', external: true },
              ].map(({ href, label, external }) => (
                <li key={href}>
                  <Link
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {YEAR} {SITE_NAME}. All rights reserved.</p>
          <p>
            {totalTools} free AI tools for the United States •{' '}
            <span className="text-gray-500">Not legal, financial, or professional advice.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
