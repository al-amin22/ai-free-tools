import type { Metadata } from 'next'
import type {
  SchemaWebApplication,
  SchemaFaqPage,
  SchemaBreadcrumb,
  Faq,
} from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aifreetools.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'

export function buildMetadata({
  title,
  description,
  path,
  ogImage,
}: {
  title: string
  description: string
  path: string
  ogImage?: string
}): Metadata {
  const url = `${SITE_URL}${path}`
  const image = ogImage ?? `${SITE_URL}/og-default.png`

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: { 'en-US': url },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  }
}

export function schemaWebApp(
  name: string,
  description: string,
  path: string
): SchemaWebApplication {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: `${SITE_URL}${path}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function schemaFaq(faqs: Faq[]): SchemaFaqPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function schemaBreadcrumb(
  items: Array<{ name: string; path: string }>
): SchemaBreadcrumb {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export function hreflang(path: string) {
  const url = `${SITE_URL}${path}`
  return [
    { rel: 'alternate', hrefLang: 'en-us', href: url },
    { rel: 'alternate', hrefLang: 'x-default', href: url },
  ]
}
