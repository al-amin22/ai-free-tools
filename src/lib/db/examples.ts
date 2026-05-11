import { createClient } from '@/lib/supabase/server'
import { getCache, setCache, TTL } from '@/lib/cache'
import type { ExampleOutput } from '@/types/database'

export async function getExampleOutputs(toolId: string, limit = 3): Promise<ExampleOutput[]> {
  const cacheKey = `example:${toolId}:${limit}`
  const cached = getCache<ExampleOutput[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('example_outputs')
      .select('*')
      .eq('tool_id', toolId)
      .order('quality_score', { ascending: false })
      .limit(limit)

    if (error) throw error

    const examples = (data ?? []) as ExampleOutput[]
    setCache(cacheKey, examples, TTL.DB_QUERY)
    return examples
  } catch (err) {
    console.error(`[db/examples] getExampleOutputs(${toolId}):`, err)
    return []
  }
}
