import type { Tool, Category, Article } from '@/types/database'

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aifreetools.us'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'AI Free Tools'

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string
  url:  string
}

function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@type':           'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type':    'ListItem',
      position:   index + 1,
      name:       item.name,
      item:       item.url,
    })),
  }
}

// ─── FAQPage ──────────────────────────────────────────────────────────────────

function faqPageSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    '@type':          'FAQPage',
    'mainEntity':     faqs.map(({ q, a }) => ({
      '@type':          'Question',
      name:             q,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    a,
      },
    })),
  }
}

// ─── Tool page schema ─────────────────────────────────────────────────────────

export function toolPageSchema(tool: Tool, category: Category): object[] {
  const toolUrl = `${SITE_URL}/tools/${category.slug}/${tool.slug}`

  const webApplication = {
    '@context':          'https://schema.org',
    '@type':             'WebApplication',
    name:                tool.name,
    description:         tool.description ?? '',
    url:                 toolUrl,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem:     'Web',
    offers: {
      '@type':       'Offer',
      price:         '0',
      priceCurrency: 'USD',
    },
    featureList: tool.how_it_works ?? [],
    inLanguage:  'en-US',
    isAccessibleForFree: true,
    provider: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     SITE_URL,
    },
  }

  const breadcrumbs = breadcrumbListSchema([
    { name: 'Home',           url: SITE_URL },
    { name: category.name,    url: `${SITE_URL}/tools/${category.slug}` },
    { name: tool.name,        url: toolUrl },
  ])

  const schemas: object[] = [
    { '@context': 'https://schema.org', ...webApplication },
    { '@context': 'https://schema.org', ...breadcrumbs },
  ]

  if (tool.faq?.length) {
    schemas.push({ '@context': 'https://schema.org', ...faqPageSchema(tool.faq) })
  }

  return schemas
}

// ─── Article page schema ──────────────────────────────────────────────────────

export function articleSchema(article: Article): object[] {
  const articleUrl = `${SITE_URL}/blog/${article.slug}`

  const articleNode = {
    '@context':      'https://schema.org',
    '@type':         'Article',
    headline:        article.title,
    description:     article.meta_description ?? '',
    url:             articleUrl,
    datePublished:   article.published_at ?? article.created_at,
    dateModified:    article.updated_at,
    inLanguage:      'en-US',
    author: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url:     `${SITE_URL}/logo.png`,
      },
    },
    wordCount: article.word_count,
    keywords:  article.keywords?.join(', '),
  }

  const breadcrumbs = breadcrumbListSchema([
    { name: 'Home',          url: SITE_URL },
    { name: 'Blog',          url: `${SITE_URL}/blog` },
    { name: article.title,   url: articleUrl },
  ])

  return [
    articleNode,
    { '@context': 'https://schema.org', ...breadcrumbs },
  ]
}

// ─── Category page schema ─────────────────────────────────────────────────────

export function categorySchema(category: Category): object[] {
  const categoryUrl = `${SITE_URL}/tools/${category.slug}`

  const collectionPage = {
    '@context':   'https://schema.org',
    '@type':      'CollectionPage',
    name:         category.name,
    description:  category.description ?? '',
    url:          categoryUrl,
    inLanguage:   'en-US',
    isAccessibleForFree: true,
  }

  const breadcrumbs = breadcrumbListSchema([
    { name: 'Home',         url: SITE_URL },
    { name: category.name,  url: categoryUrl },
  ])

  return [
    collectionPage,
    { '@context': 'https://schema.org', ...breadcrumbs },
  ]
}

// ─── Home page schema ─────────────────────────────────────────────────────────

export function homeSchema(): object[] {
  const website = {
    '@context': 'https://schema.org',
    '@type':    'WebSite',
    name:       SITE_NAME,
    url:        SITE_URL,
    inLanguage: 'en-US',
    description:
      'Free AI-powered tools for legal documents, real estate, HR, finance, and copywriting — built for the United States.',
    potentialAction: {
      '@type':       'SearchAction',
      target: {
        '@type':        'EntryPoint',
        urlTemplate:    `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name:    SITE_NAME,
      url:     SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url:     `${SITE_URL}/logo.png`,
      },
    },
  }

  return [website]
}
