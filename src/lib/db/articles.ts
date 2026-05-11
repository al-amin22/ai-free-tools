import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCache, setCache, invalidateCache, TTL } from '@/lib/cache'
import type { Article, ArticleInsert, ArticleUpdate } from '@/types/database'

const CACHE_PREFIX = 'article'

export async function getPublishedArticles(
  limit = 10,
  offset = 0
): Promise<Article[]> {
  const cacheKey = `${CACHE_PREFIX}:list:${limit}:${offset}`
  const cached = getCache<Article[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const articles = (data ?? []) as Article[]
    setCache(cacheKey, articles, TTL.DB_QUERY)
    return articles
  } catch (err) {
    console.error('[db/articles] getPublishedArticles:', err)
    return []
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const cacheKey = `${CACHE_PREFIX}:slug:${slug}`
  const cached = getCache<Article>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    const article = data as Article
    setCache(cacheKey, article, TTL.DB_QUERY)
    return article
  } catch (err) {
    console.error(`[db/articles] getArticleBySlug(${slug}):`, err)
    return null
  }
}

export async function createArticle(articleData: ArticleInsert): Promise<Article> {
  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single()

    if (error) throw error

    // Bust list cache so new article appears
    invalidateCache(`${CACHE_PREFIX}:list:10:0`)

    return data as Article
  } catch (err) {
    console.error('[db/articles] createArticle:', err)
    throw err
  }
}

export async function getArticlesByCategory(
  categoryId: string,
  limit = 3
): Promise<Article[]> {
  const cacheKey = `${CACHE_PREFIX}:cat:${categoryId}:${limit}`
  const cached = getCache<Article[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    const articles = (data ?? []) as Article[]
    setCache(cacheKey, articles, TTL.DB_QUERY)
    return articles
  } catch (err) {
    console.error(`[db/articles] getArticlesByCategory(${categoryId}):`, err)
    return []
  }
}

export async function updateArticle(
  id: string,
  updates: ArticleUpdate
): Promise<void> {
  try {
    const supabase = await createServiceClient()
    const { error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    if (updates.slug) invalidateCache(`${CACHE_PREFIX}:slug:${updates.slug}`)
    invalidateCache(`${CACHE_PREFIX}:list:10:0`)
  } catch (err) {
    console.error(`[db/articles] updateArticle(${id}):`, err)
    throw err
  }
}

// ─── Blog listing — filterable + paginated ────────────────────────────────────

export interface ArticleFilterOpts {
  limit?:      number
  offset?:     number
  categoryId?: string | null
  search?:     string | null
}

export async function getFilteredArticles(opts: ArticleFilterOpts = {}): Promise<Article[]> {
  const { limit = 12, offset = 0, categoryId, search } = opts
  try {
    const supabase = await createClient()
    let query = supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (search)     query = query.or(`title.ilike.%${search}%,meta_description.ilike.%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as Article[]
  } catch (err) {
    console.error('[db/articles] getFilteredArticles:', err)
    return []
  }
}

export async function countPublishedArticles(opts: Pick<ArticleFilterOpts, 'categoryId' | 'search'> = {}): Promise<number> {
  const { categoryId, search } = opts
  try {
    const supabase = await createClient()
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)

    if (categoryId) query = query.eq('category_id', categoryId)
    if (search)     query = query.or(`title.ilike.%${search}%,meta_description.ilike.%${search}%`)

    const { count, error } = await query
    if (error) throw error
    return count ?? 0
  } catch (err) {
    console.error('[db/articles] countPublishedArticles:', err)
    return 0
  }
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string | null,
  limit = 3
): Promise<Article[]> {
  const cacheKey = `${CACHE_PREFIX}:related:${articleId}:${limit}`
  const cached = getCache<Article[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    let query = supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .neq('id', articleId)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) throw error
    const articles = (data ?? []) as Article[]
    setCache(cacheKey, articles, TTL.DB_QUERY)
    return articles
  } catch (err) {
    console.error(`[db/articles] getRelatedArticles(${articleId}):`, err)
    return []
  }
}

export async function getLatestArticles(limit = 5): Promise<Article[]> {
  const cacheKey = `${CACHE_PREFIX}:latest:${limit}`
  const cached = getCache<Article[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    const articles = (data ?? []) as Article[]
    setCache(cacheKey, articles, TTL.DB_QUERY)
    return articles
  } catch (err) {
    console.error('[db/articles] getLatestArticles:', err)
    return []
  }
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('articles')
      .select('slug')
      .eq('is_published', true)

    if (error) throw error
    return (data ?? []).map((r: { slug: string }) => r.slug)
  } catch (err) {
    console.error('[db/articles] getAllPublishedSlugs:', err)
    return []
  }
}
