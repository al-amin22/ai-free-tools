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

    // Bust slug cache if slug is known
    if (updates.slug) invalidateCache(`${CACHE_PREFIX}:slug:${updates.slug}`)
    invalidateCache(`${CACHE_PREFIX}:list:10:0`)
  } catch (err) {
    console.error(`[db/articles] updateArticle(${id}):`, err)
    throw err
  }
}
