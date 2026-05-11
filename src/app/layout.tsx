import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://aifreetools.us'
const SITE_NAME     = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'
const GA_ID         = process.env.NEXT_PUBLIC_GA_ID
const ADSENSE_ID    = process.env.NEXT_PUBLIC_ADSENSE_ID

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — Free AI Tools for the United States`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Free AI-powered tools for US legal documents, real estate, HR, finance & copywriting. No sign up required. Instant results.',
  keywords:    ['free AI tools', 'US legal documents', 'AI generator', 'United States'],
  authors:     [{ name: SITE_NAME }],
  creator:     SITE_NAME,
  publisher:   SITE_NAME,
  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': SITE_URL },
  },
  openGraph: {
    type:      'website',
    locale:    'en_US',
    url:       SITE_URL,
    siteName:  SITE_NAME,
    title:     `${SITE_NAME} — Free AI Tools for the United States`,
    description:
      'Free AI-powered tools for US legal documents, real estate, HR, finance & copywriting.',
    images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    site:        '@aifreetools',
    title:       `${SITE_NAME} — Free AI Tools for the US`,
    description: 'Free AI-powered tools for legal, real estate, HR, finance & more.',
    images:      [`${SITE_URL}/og-default.png`],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* hreflang — all pages target US English */}
        <link rel="alternate" hrefLang="en-US" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        {/* AdSense — load after interactive so it doesn't block FCP */}
        {ADSENSE_ID && ADSENSE_ID !== 'ca-pub-XXXXXXXX' && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </head>

      <body className="min-h-full flex flex-col bg-gray-50 font-[family-name:var(--font-inter)] antialiased">
        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{page_path:window.location.pathname})`}
            </Script>
          </>
        )}

        <Header />

        <main className="flex-1" id="main-content">
          {children}
        </main>

        <Footer />

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  )
}
