import { createClient } from '@/lib/supabase/server'
import { getCache, setCache, invalidateCache, generateCacheKey, TTL } from '@/lib/cache'
import type { Tool } from '@/types/database'

const CACHE_PREFIX = 'tool'

export async function getAllTools(): Promise<Tool[]> {
  const cacheKey = `${CACHE_PREFIX}:all`
  const cached = getCache<Tool[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tools')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    const tools = (data ?? []) as Tool[]
    setCache(cacheKey, tools, TTL.DB_QUERY)
    return tools
  } catch (err) {
    console.error('[db/tools] getAllTools:', err)
    return []
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const cacheKey = `${CACHE_PREFIX}:slug:${slug}`
  const cached = getCache<Tool>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tools')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null  // not found
      throw error
    }

    const tool = data as Tool
    setCache(cacheKey, tool, TTL.DB_QUERY)
    return tool
  } catch (err) {
    console.error(`[db/tools] getToolBySlug(${slug}):`, err)
    return null
  }
}

export async function getToolById(id: string): Promise<Tool | null> {
  const cacheKey = `${CACHE_PREFIX}:id:${id}`
  const cached = getCache<Tool>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tools')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    const tool = data as Tool
    setCache(cacheKey, tool, TTL.DB_QUERY)
    return tool
  } catch (err) {
    console.error(`[db/tools] getToolById(${id}):`, err)
    return null
  }
}

export async function getToolsByCategory(categorySlug: string): Promise<Tool[]> {
  const cacheKey = `${CACHE_PREFIX}:category:${categorySlug}`
  const cached = getCache<Tool[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tools')
      .select('*, category:categories!inner(*)')
      .eq('is_active', true)
      .eq('categories.slug', categorySlug)
      .order('sort_order', { ascending: true })

    if (error) throw error

    const tools = (data ?? []) as Tool[]
    setCache(cacheKey, tools, TTL.DB_QUERY)
    return tools
  } catch (err) {
    console.error(`[db/tools] getToolsByCategory(${categorySlug}):`, err)
    return []
  }
}

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  const cacheKey = `${CACHE_PREFIX}:featured:${limit}`
  const cached = getCache<Tool[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tools')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) throw error

    const tools = (data ?? []) as Tool[]
    setCache(cacheKey, tools, TTL.DB_QUERY)
    return tools
  } catch (err) {
    console.error('[db/tools] getFeaturedTools:', err)
    return []
  }
}

export async function getRelatedTools(ids: string[]): Promise<Tool[]> {
  if (!ids.length) return []

  const cacheKey = generateCacheKey('related', { ids: [...ids].sort() })
  const cached = getCache<Tool[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('tools')
      .select('*, category:categories(*)')
      .in('id', ids)
      .eq('is_active', true)

    if (error) throw error

    const tools = (data ?? []) as Tool[]
    setCache(cacheKey, tools, TTL.DB_QUERY)
    return tools
  } catch (err) {
    console.error('[db/tools] getRelatedTools:', err)
    return []
  }
}

export async function incrementToolUses(toolId: string): Promise<void> {
  try {
    const supabase = await createClient()
    // Use RPC to safely increment without a race condition
    const { error } = await supabase.rpc('increment_view_count', { tool_id: toolId })
    if (error) throw error

    // Bust slug-level cache so view_count reflects on next load
    invalidateCache(`${CACHE_PREFIX}:all`)
  } catch (err) {
    // Non-critical — log but don't throw
    console.error(`[db/tools] incrementToolUses(${toolId}):`, err)
  }
}

export async function updateSatisfactionScore(
  toolId: string,
  newRating: 'thumbs_up' | 'thumbs_down'
): Promise<void> {
  try {
    const supabase = await createClient()

    // Re-compute score from all feedback for this tool
    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('tool_id', toolId)

    if (error) throw error

    const total = data.length
    if (total === 0) return

    const positive = data.filter((r) => r.rating === 'thumbs_up').length
    const score = Math.round((positive / total) * 100)

    const { error: updateError } = await supabase
      .from('tools')
      .update({ satisfaction_score: score })
      .eq('id', toolId)

    if (updateError) throw updateError

    // Invalidate cache for this tool
    invalidateCache(`${CACHE_PREFIX}:all`)
    invalidateCache(`${CACHE_PREFIX}:featured:6`)
  } catch (err) {
    console.error(`[db/tools] updateSatisfactionScore(${toolId}):`, err)
  }
}
