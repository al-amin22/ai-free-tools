import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aifreetools.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: '65 free AI-powered tools for legal, HR, business, writing, and more.',
  robots: { index: true, follow: true },
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': SITE_URL },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${geist.variable} h-full`}>
      <head>
        <link rel="alternate" hrefLang="en-us" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />

        {/* Google AdSense */}
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>

      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}

        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}
      </body>
    </html>
  )
}
