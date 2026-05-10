import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCache, setCache, invalidateCache, TTL } from '@/lib/cache'

const CACHE_PREFIX = 'feedback'

export async function saveFeedback(
  toolId: string,
  rating: 'thumbs_up' | 'thumbs_down',
  ipHash: string,
  comment?: string
): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('feedback').insert({
      tool_id:    toolId,
      rating,
      ip_address: ipHash,
      comment:    comment ?? null,
    })

    if (error) throw error

    // Invalidate cached score so next read recomputes
    invalidateCache(`${CACHE_PREFIX}:score:${toolId}`)
  } catch (err) {
    console.error(`[db/feedback] saveFeedback(${toolId}):`, err)
    throw err
  }
}

export async function getToolSatisfactionScore(toolId: string): Promise<number> {
  const cacheKey = `${CACHE_PREFIX}:score:${toolId}`
  const cached = getCache<number>(cacheKey)
  if (cached !== null) return cached

  try {
    const supabase = await createServiceClient()
    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('tool_id', toolId)

    if (error) throw error

    const total = data.length
    if (total === 0) return 0

    const positive = data.filter((r) => r.rating === 'thumbs_up').length
    const score = Math.round((positive / total) * 100)

    setCache(cacheKey, score, TTL.GENERATE)   // 1 hour — refreshes as votes come in
    return score
  } catch (err) {
    console.error(`[db/feedback] getToolSatisfactionScore(${toolId}):`, err)
    return 0
  }
}
