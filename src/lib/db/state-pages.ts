import { createClient }       from '@/lib/supabase/server'
import { getCache, setCache, TTL } from '@/lib/cache'
import type { StatePage }    from '@/types/database'
import { STATE_BY_SLUG }     from '@/lib/data/us-states'

const CACHE_PREFIX = 'statepage'

// ─── Extended type with tool+category join ────────────────────────────────────

export interface StatePageWithTool extends StatePage {
  tool: {
    slug: string
    name: string
    category: {
      slug: string
      name: string
    }
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getStatePageContent(
  toolId:    string,
  stateSlug: string
): Promise<StatePage | null> {
  const state = STATE_BY_SLUG.get(stateSlug)
  if (!state) return null

  const cacheKey = `${CACHE_PREFIX}:${toolId}:${state.code}`
  const cached   = getCache<StatePage>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('state_pages')
      .select('*')
      .eq('tool_id', toolId)
      .eq('state_code', state.code)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null  // row not found — use template
      throw error
    }

    setCache(cacheKey, data as StatePage, TTL.DB_QUERY)
    return data as StatePage
  } catch (err) {
    console.error(`[db/state-pages] getStatePageContent(${toolId}, ${stateSlug}):`, err)
    return null
  }
}

/** Returns all active state pages joined with their tool and category for generateStaticParams. */
export async function getAllStatePages(): Promise<StatePageWithTool[]> {
  const cacheKey = `${CACHE_PREFIX}:all`
  const cached   = getCache<StatePageWithTool[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('state_pages')
      .select(`
        *,
        tool:tools!inner(
          slug,
          name,
          category:categories!inner(slug, name)
        )
      `)
      .eq('is_active', true)

    if (error) throw error

    const pages = (data ?? []) as StatePageWithTool[]
    setCache(cacheKey, pages, TTL.DB_QUERY)
    return pages
  } catch (err) {
    console.error('[db/state-pages] getAllStatePages:', err)
    return []
  }
}

/** Returns all active state pages for a single tool (for the "other states" sidebar). */
export async function getStatePagesByTool(toolId: string): Promise<StatePage[]> {
  const cacheKey = `${CACHE_PREFIX}:tool:${toolId}`
  const cached   = getCache<StatePage[]>(cacheKey)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('state_pages')
      .select('*')
      .eq('tool_id', toolId)
      .eq('is_active', true)
      .order('state_name', { ascending: true })

    if (error) throw error

    const pages = (data ?? []) as StatePage[]
    setCache(cacheKey, pages, TTL.DB_QUERY)
    return pages
  } catch (err) {
    console.error(`[db/state-pages] getStatePagesByTool(${toolId}):`, err)
    return []
  }
}
