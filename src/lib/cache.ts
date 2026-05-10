import { createHash } from 'crypto'

export const TTL = {
  GENERATE: 3_600,   // 1 hour — AI generated content
  DB_QUERY: 86_400,  // 24 hours — database lookups
} as const

interface CacheEntry<T> {
  value: T
  expiresAt: number  // ms timestamp
}

// Module-level singleton — survives across requests in the same Node process
const store = new Map<string, CacheEntry<unknown>>()

// Purge expired entries every 10 minutes to avoid unbounded growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key)
  }
}, 600_000).unref()  // .unref() so the timer doesn't keep the process alive

export function setCache<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1_000,
  })
}

export function getCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function invalidateCache(key: string): void {
  store.delete(key)
}

// Stable cache key: sha256(toolId + canonical JSON of inputs)
export function generateCacheKey(
  toolId: string,
  inputs: Record<string, unknown>
): string {
  const canonical = JSON.stringify(inputs, Object.keys(inputs).sort())
  return createHash('sha256')
    .update(`${toolId}:${canonical}`)
    .digest('hex')
}
