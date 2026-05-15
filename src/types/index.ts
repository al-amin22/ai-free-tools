export type ToolCategory =
  | 'legal' | 'real_estate' | 'hr' | 'business' | 'content'
  | 'calculator' | 'writing' | 'marketing' | 'finance' | 'education'

export type AiModel = 'groq-llama-70b' | 'groq-llama-8b' | 'gemini-flash'

export type ArticleStatus = 'draft' | 'published' | 'archived'

export interface Tool {
  id: number
  slug: string
  name: string
  description: string
  category: ToolCategory
  icon: string | null
  is_active: boolean
  sort_order: number
  meta_title: string
  meta_description: string
  schema_type: string
  ai_model: AiModel
  temperature: number
  min_words: number
  system_prompt_id: number | null
  config: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface Prompt {
  id: number
  tool_id: number
  name: string
  content: string
  version: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Faq {
  id: number
  tool_id: number
  question: string
  answer: string
  sort_order: number
}

export interface Article {
  id: number
  tool_id: number
  slug: string
  title: string
  content: string
  excerpt: string
  status: ArticleStatus
  meta_title: string
  meta_description: string
  focus_keyword: string | null
  trend_keyword: string | null
  trend_score: number | null
  angle: string | null
  angle_index: number | null
  content_hash: string | null
  word_count: number | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface AiGenerateOptions {
  model: AiModel
  systemPrompt: string
  userPrompt: string
  temperature: number
  maxTokens?: number
}

export interface AiResult {
  content: string
  model: string
  wordCount: number
  inputTokens?: number
  outputTokens?: number
}

export interface SeoMetadata {
  title: string
  description: string
  canonical: string
  ogImage?: string
}

export interface SchemaWebApplication {
  '@context': 'https://schema.org'
  '@type': 'WebApplication'
  name: string
  description: string
  url: string
  applicationCategory: string
  operatingSystem: 'Web'
  offers: { '@type': 'Offer'; price: '0'; priceCurrency: 'USD' }
}

export interface SchemaFaqPage {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: { '@type': 'Answer'; text: string }
  }>
}

export interface SchemaBreadcrumb {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export interface AdSlots {
  leaderboard: string
  rectangle: string
  inArticle: string
  sidebar: string
}

export interface ApiError {
  error: string
  code?: string
}

export interface ApiSuccess<T> {
  data: T
  cached?: boolean
}
