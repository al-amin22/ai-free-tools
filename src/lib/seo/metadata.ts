import type { Metadata } from 'next'
import type { Tool, Category, Article } from '@/types/database'

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aifreetools.us'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'
const OG_IMAGE  = `${SITE_URL}/og-default.png`

// Shared hreflang alternate so every page targets en-US
function enUsAlternates(canonical: string) {
  return {
    canonical,
    languages: { 'en-US': canonical },
  }
}

function openGraphBase(params: {
  title: string
  description: string
  url: string
  image?: string
}) {
  return {
    type:        'website' as const,
    locale:      'en_US',
    siteName:    SITE_NAME,
    title:       params.title,
    description: params.description,
    url:         params.url,
    images: [
      {
        url:    params.image ?? OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    params.title,
      },
    ],
  }
}

function twitterBase(title: string, description: string, image?: string) {
  return {
    card:        'summary_large_image' as const,
    title,
    description,
    images:      [image ?? OG_IMAGE],
    site:        '@aifreetools',
  }
}

// ─── Tool page ────────────────────────────────────────────────────────────────

export function generateToolMetadata(tool: Tool, category: Category): Metadata {
  const title       = tool.meta_title       ?? `${tool.name} — Free AI Tool`
  const description = tool.meta_description ?? tool.description ?? ''
  const canonical   = `${SITE_URL}/tools/${category.slug}/${tool.slug}`
  const ogImage     = `${SITE_URL}/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(category.name)}`

  return {
    title,
    description,
    keywords: [
      tool.primary_keyword ?? tool.name,
      ...tool.secondary_keywords,
      category.name,
      'free',
      'AI',
      'United States',
    ].filter(Boolean),
    alternates: enUsAlternates(canonical),
    openGraph: {
      ...openGraphBase({ title, description, url: canonical, image: ogImage }),
      type: 'website',
    },
    twitter: twitterBase(title, description, ogImage),
    robots: {
      index:              true,
      follow:             true,
      googleBot: {
        index:                  true,
        follow:                 true,
        'max-video-preview':    -1,
        'max-image-preview':    'large',
        'max-snippet':          -1,
      },
    },
  }
}

// ─── Article page ─────────────────────────────────────────────────────────────

export function generateArticleMetadata(article: Article): Metadata {
  const title       = article.meta_title       ?? article.title
  const description = article.meta_description ?? ''
  const canonical   = `${SITE_URL}/blog/${article.slug}`

  return {
    title,
    description,
    keywords: article.keywords,
    alternates: enUsAlternates(canonical),
    openGraph: {
      ...openGraphBase({ title, description, url: canonical }),
      type:            'article',
      publishedTime:   article.published_at ?? undefined,
      modifiedTime:    article.updated_at,
    },
    twitter: twitterBase(title, description),
    robots: { index: true, follow: true },
  }
}

// ─── State-specific tool page ────────────────────────────────────────────────

export function generateStateMetadata(
  tool:      Tool,
  category:  Category,
  stateName: string,
  stateCode: string,
  metaTitleOverride?:  string | null,
  metaDescOverride?:   string | null,
): Metadata {
  const title = metaTitleOverride
    ?? `Free ${tool.name} for ${stateName} — AI Powered | ${SITE_NAME}`
  const description = metaDescOverride
    ?? `Generate a free ${tool.name.toLowerCase()} specific to ${stateName} in seconds. AI-powered, ${stateName} state law compliant. No sign up required.`
  const canonical = `${SITE_URL}/tools/${category.slug}/${tool.slug}/${stateName.toLowerCase().replace(/\s+/g, '-')}`
  const ogImage   = `${SITE_URL}/api/og?title=${encodeURIComponent(`${tool.name} — ${stateName}`)}&category=${encodeURIComponent(category.name)}&catSlug=${category.slug}`

  return {
    title,
    description,
    keywords: [
      `${tool.name} ${stateName}`,
      `${stateName} ${tool.primary_keyword ?? tool.name}`,
      `free ${tool.name.toLowerCase()} ${stateCode}`,
      ...tool.secondary_keywords,
      stateName,
      'free',
      'AI',
    ].filter(Boolean),
    alternates: enUsAlternates(canonical),
    openGraph: {
      ...openGraphBase({ title, description, url: canonical, image: ogImage }),
      type: 'website',
    },
    twitter: twitterBase(title, description, ogImage),
    robots: {
      index:    true,
      follow:   true,
      googleBot: {
        index:               true,
        follow:              true,
        'max-image-preview': 'large',
        'max-snippet':       -1,
      },
    },
  }
}

// ─── Category page ────────────────────────────────────────────────────────────

export function generateCategoryMetadata(category: Category): Metadata {
  const title       = category.meta_title       ?? `Free AI ${category.name} Tools — US`
  const description = category.meta_description ?? category.description ?? ''
  const canonical   = `${SITE_URL}/tools/${category.slug}`

  return {
    title,
    description,
    keywords: [category.name, 'free AI tools', 'United States', 'US', 'online'],
    alternates: enUsAlternates(canonical),
    openGraph: openGraphBase({ title, description, url: canonical }),
    twitter: twitterBase(title, description),
    robots: { index: true, follow: true },
  }
}

// ─── Home page ────────────────────────────────────────────────────────────────

export function generateHomeMetadata(): Metadata {
  const title       = `${SITE_NAME} — 65 Free AI Tools for the United States`
  const description =
    'Free AI-powered tools for US legal documents, real estate, HR, finance, small business, and copywriting. No sign up, 100% free, instant results.'
  const canonical   = SITE_URL

  return {
    title,
    description,
    keywords: [
      'free AI tools',
      'AI legal document generator',
      'AI HR tools',
      'AI finance tools',
      'United States',
      'free online tools',
    ],
    alternates: enUsAlternates(canonical),
    openGraph: openGraphBase({ title, description, url: canonical }),
    twitter: twitterBase(title, description),
    robots: { index: true, follow: true },
  }
}
