import { createClient } from '@/lib/supabase/server'
import { getCache, setCache, TTL } from '@/lib/cache'
import type { Category } from '@/types/database'

const CACHE_PREFIX = 'cat'

export async function getAllCategories(): Promise<Category[]> {
  const cacheKey = `${CACHE_PREFIX}:all`
  const cached = getCache<Category[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    const categories = (data ?? []) as Category[]
    setCache(cacheKey, categories, TTL.DB_QUERY)
    return categories
  } catch (err) {
    console.error('[db/categories] getAllCategories:', err)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cacheKey = `${CACHE_PREFIX}:slug:${slug}`
  const cached = getCache<Category>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    const category = data as Category
    setCache(cacheKey, category, TTL.DB_QUERY)
    return category
  } catch (err) {
    console.error(`[db/categories] getCategoryBySlug(${slug}):`, err)
    return null
  }
}
