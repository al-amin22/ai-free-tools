import { createClient } from '@/lib/supabase/server'
import { getCache, setCache, TTL } from '@/lib/cache'
import type { AdSenseConfig, SiteConfigRow } from '@/types/database'

const CACHE_KEY = 'site_config:all'

async function loadAllConfig(): Promise<Record<string, string>> {
  const cached = getCache<Record<string, string>>(CACHE_KEY)
  if (cached) return cached

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')

    if (error) throw error

    const config: Record<string, string> = {}
    for (const row of (data ?? []) as Pick<SiteConfigRow, 'key' | 'value'>[]) {
      config[row.key] = row.value
    }

    setCache(CACHE_KEY, config, TTL.DB_QUERY)
    return config
  } catch (err) {
    console.error('[db/config] loadAllConfig:', err)
    return {}
  }
}

export async function getSiteConfig(): Promise<Record<string, string>> {
  return loadAllConfig()
}

export async function getConfigValue(key: string): Promise<string | null> {
  const config = await loadAllConfig()
  return config[key] ?? null
}

export async function getAdSenseConfig(): Promise<AdSenseConfig> {
  const config = await loadAllConfig()

  return {
    publisherId: config['adsense_publisher_id'] ?? '',
    slots: {
      top:          config['adsense_slot_top']       ?? '',
      sidebar:      config['adsense_slot_sidebar']   ?? '',
      belowOutput:  config['adsense_slot_below_out'] ?? '',
      mid:          config['adsense_slot_mid']        ?? '',
      bottom:       config['adsense_slot_bottom']    ?? '',
    },
  }
}
