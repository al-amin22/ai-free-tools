interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value as T
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function cacheDel(key: string): void {
  store.delete(key)
}

export function cacheDelPattern(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

/** Fetch-or-set: returns cached value or calls loader and caches result. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = cacheGet<T>(key)
  if (hit !== null) return hit
  const value = await loader()
  cacheSet(key, value, ttlSeconds)
  return value
}

// TTL presets (seconds)
export const TTL = {
  SHORT: 60,         // 1 min  — high-traffic API responses
  MEDIUM: 300,       // 5 min  — tool config, prompts
  LONG: 3_600,       // 1 hr   — FAQs, static tool metadata
  DAY: 86_400,       // 24 hr  — article lists
}
