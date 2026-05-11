// ─── Shared primitives ────────────────────────────────────────────────────────

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'radio' | 'checkbox' | 'state_selector'
  placeholder?: string
  required: boolean
  options?: string[]
  maxLength?: number
}

export interface FAQ {
  q: string
  a: string
}

// ─── Database row types ───────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  meta_title: string | null
  meta_description: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Tool {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  meta_title: string | null
  meta_description: string | null
  h1_text: string | null
  primary_keyword: string | null
  secondary_keywords: string[]
  ai_prompt: string
  ai_model: string
  min_output_length: number
  required_elements: string[]
  form_fields: FormField[]
  how_it_works: string[]
  faq: FAQ[]
  is_active: boolean
  is_featured: boolean
  sort_order: number
  view_count: number
  satisfaction_score: number | null  // 0–100, denormalized from feedback
  created_at: string
  updated_at: string
  // joined relation
  category?: Category
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  meta_title: string | null
  meta_description: string | null
  keywords: string[]
  tool_id: string | null
  category_id: string | null
  is_published: boolean
  published_at: string | null
  word_count: number
  ai_model: string | null
  created_at: string
  updated_at: string
}

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>
export type ArticleUpdate = Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>

export interface Keyword {
  id: string
  keyword: string
  search_volume: number
  difficulty: number
  category_id: string | null
  tool_id: string | null
  is_target: boolean
  created_at: string
  updated_at: string
}

export interface RankingHistory {
  id: string
  keyword_id: string
  position: number | null
  url: string | null
  checked_at: string
  created_at: string
  updated_at: string
}

export interface SiteConfigRow {
  id: string
  key: string
  value: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface AdSenseConfig {
  publisherId: string
  slots: {
    top: string
    sidebar: string
    belowOutput: string
    mid: string
    bottom: string
  }
}

export interface Feedback {
  id: string
  tool_id: string
  ip_address: string
  rating: 'thumbs_up' | 'thumbs_down'
  comment: string | null
  created_at: string
  updated_at: string
}

export interface ToolUsage {
  id: string
  tool_id: string
  ip_address: string
  user_id: string | null
  request_count: number
  window_start: string
  created_at: string
  updated_at: string
}

export interface ExampleOutput {
  id: string
  tool_id: string
  input_data: Record<string, unknown>
  output_text: string
  quality_score: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface PerformanceLog {
  id: string
  url: string
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
  device: 'mobile' | 'desktop' | 'tablet' | null
  ip_address: string | null
  created_at: string
  updated_at: string
}

export interface BacklinkOpportunity {
  id: string
  platform: string
  url: string
  title: string | null
  tool_id: string | null
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'ignored'
  notes: string | null
  found_at: string
  submitted_at: string | null
  created_at: string
  updated_at: string
}

export interface StatePage {
  id: string
  tool_id: string
  state_code: string
  state_name: string
  content: string | null
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIJob {
  id: string
  job_type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_data: Record<string, unknown>
  output_data: Record<string, unknown> | null
  error_message: string | null
  ai_model: string | null
  duration_ms: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}
