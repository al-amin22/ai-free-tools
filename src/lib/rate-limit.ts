import { createHash } from 'crypto'
import { type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const LIMIT_ANON       = 5    // requests per window
const LIMIT_REGISTERED = 20
const WINDOW_HOURS     = 1
const WINDOW_MS        = WINDOW_HOURS * 60 * 60 * 1_000

export interface RateLimitResult {
  allowed: boolean
  remaining: number   // requests left in current window
  resetIn: number     // seconds until window resets
}

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

export async function checkRateLimit(
  request: NextRequest,
  toolId: string,
  isRegistered = false
): Promise<RateLimitResult> {
  const limit = isRegistered ? LIMIT_REGISTERED : LIMIT_ANON
  const ip    = getClientIP(request)
  const ipHash = hashIP(ip)
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

  const supabase = await createServiceClient()

  // Count requests in current window for this IP + tool
  const { data, error } = await supabase
    .from('tool_usage')
    .select('id, request_count, window_start')
    .eq('ip_address', ipHash)
    .eq('tool_id', toolId)
    .gte('window_start', windowStart)
    .order('window_start', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows — treat as first request
    console.error('[rate-limit] DB read error:', error.message)
    // Fail open so a DB hiccup doesn't lock out all users
    return { allowed: true, remaining: limit - 1, resetIn: WINDOW_HOURS * 3600 }
  }

  const now = Date.now()

  if (!data) {
    // First request in window — create row
    await supabase.from('tool_usage').insert({
      tool_id:       toolId,
      ip_address:    ipHash,
      request_count: 1,
      window_start:  new Date().toISOString(),
    })
    return { allowed: true, remaining: limit - 1, resetIn: WINDOW_HOURS * 3600 }
  }

  const used = data.request_count
  const windowAge = now - new Date(data.window_start).getTime()
  const resetIn = Math.ceil((WINDOW_MS - windowAge) / 1_000)

  if (used >= limit) {
    return { allowed: false, remaining: 0, resetIn: Math.max(0, resetIn) }
  }

  // Increment counter
  await supabase
    .from('tool_usage')
    .update({ request_count: used + 1 })
    .eq('id', data.id)

  return { allowed: true, remaining: limit - used - 1, resetIn: Math.max(0, resetIn) }
}
