import { createServiceClient } from '@/lib/supabase/server'
import { getCache, setCache, invalidateCache, TTL } from '@/lib/cache'
import type { Keyword } from '@/types/database'

const CACHE_PREFIX = 'kw'

export async function getKeywordsByTool(toolId: string): Promise<Keyword[]> {
  const cacheKey = `${CACHE_PREFIX}:tool:${toolId}`
  const cached = getCache<Keyword[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('tool_id', toolId)
      .eq('is_target', true)
      .order('search_volume', { ascending: false })

    if (error) throw error

    const keywords = (data ?? []) as Keyword[]
    setCache(cacheKey, keywords, TTL.DB_QUERY)
    return keywords
  } catch (err) {
    console.error(`[db/keywords] getKeywordsByTool(${toolId}):`, err)
    return []
  }
}

export async function updateKeywordRanking(
  keywordId: string,
  position: number | null
): Promise<void> {
  try {
    const supabase = await createServiceClient()

    // Append to history
    const { error: historyError } = await supabase
      .from('ranking_history')
      .insert({ keyword_id: keywordId, position, checked_at: new Date().toISOString() })

    if (historyError) throw historyError

    invalidateCache(`${CACHE_PREFIX}:history:${keywordId}`)
  } catch (err) {
    console.error(`[db/keywords] updateKeywordRanking(${keywordId}):`, err)
    throw err
  }
}

export interface KeywordOpportunityInsert {
  keyword: string
  search_volume?: number
  difficulty?: number
  tool_id?: string
  category_id?: string
}

export async function insertKeywordOpportunity(
  data: KeywordOpportunityInsert
): Promise<void> {
  try {
    const supabase = await createServiceClient()
    const { error } = await supabase
      .from('keywords')
      .upsert(
        { ...data, is_target: true },
        { onConflict: 'keyword' }
      )

    if (error) throw error

    if (data.tool_id) invalidateCache(`${CACHE_PREFIX}:tool:${data.tool_id}`)
  } catch (err) {
    console.error('[db/keywords] insertKeywordOpportunity:', err)
    throw err
  }
}
