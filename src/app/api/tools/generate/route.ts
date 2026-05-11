import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient }           from '@/lib/supabase/server'
import { callAI }                        from '@/lib/ai'
import { withRetry }                     from '@/lib/ai/validator'
import { checkRateLimit }                from '@/lib/rate-limit'
import { getCache, setCache, generateCacheKey, TTL } from '@/lib/cache'
import type { Category as ValidatorCategory } from '@/lib/ai/validator'

// ─── Slug → validator category mapping ───────────────────────────────────────

const SLUG_TO_CATEGORY: Record<string, ValidatorCategory> = {
  'legal-documents': 'legal',
  'real-estate':     'real-estate',
  'hr-recruitment':  'hr',
  'finance-tax':     'finance',
  'small-business':  'business',
  'copywriting':     'content',
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(template: string, inputs: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => inputs[key] ?? `[${key}]`)
}

// ─── Simple A/B variant — deterministic per toolId ───────────────────────────

function getVariant(toolId: string): 'a' | 'b' {
  let hash = 0
  for (let i = 0; i < toolId.length; i++) hash = (hash * 31 + toolId.charCodeAt(i)) | 0
  return Math.abs(hash) % 2 === 0 ? 'a' : 'b'
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse body
  let toolId: string
  let inputs: Record<string, string>

  try {
    const body = await request.json()
    toolId = body.toolId
    inputs = body.inputs ?? {}
    if (!toolId || typeof toolId !== 'string') throw new Error('missing toolId')
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // 2. Rate limit — fail-open on errors (checkRateLimit handles that internally)
  const rl = await checkRateLimit(request, toolId)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limit', resetIn: rl.resetIn },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.resetIn),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  // 3. Cache hit — return immediately
  const cacheKey = generateCacheKey(toolId, inputs)
  const cached = getCache<{ output: string; model: string }>(cacheKey)
  if (cached) {
    return NextResponse.json({ ...cached, cached: true })
  }

  // 4. Load tool from DB
  const supabase = createServiceClient()
  const { data: tool, error: toolErr } = await supabase
    .from('tools')
    .select('id, name, ai_prompt, ai_model, min_output_length, required_elements, category:categories(slug)')
    .eq('id', toolId)
    .eq('is_active', true)
    .single()

  if (toolErr || !tool) {
    console.error('[generate] tool not found:', toolId, toolErr)
    return NextResponse.json({ error: 'tool_not_found' }, { status: 404 })
  }

  // 5. Build prompt — Variant B appends a formatting instruction
  const variant = getVariant(toolId)
  let prompt = buildPrompt(tool.ai_prompt, inputs)

  if (variant === 'b') {
    prompt += '\n\nFormat the output with clear sections and professional headings.'
  }

  // 6. Determine AI model from tool config + long-output flag
  const isLong = tool.ai_model === 'gemini' || tool.min_output_length > 700
  const catSlug = (tool.category as { slug?: string } | null)?.slug ?? ''
  const validatorCategory = SLUG_TO_CATEGORY[catSlug] ?? 'content'

  // 7. Generate with retry + validation
  let result: { output: string; attempts: number; valid: boolean }
  try {
    result = await withRetry(
      () => callAI(prompt, { long: isLong }),
      validatorCategory,
      tool.name
    )
  } catch (err) {
    console.error('[generate] withRetry threw:', err)
    return NextResponse.json({ error: 'ai_failed' }, { status: 500 })
  }

  if (!result.output?.trim()) {
    return NextResponse.json({ error: 'ai_failed' }, { status: 500 })
  }

  // 8. Track usage (non-blocking — fire and forget)
  void supabase.from('tool_usage').insert({
    tool_id:    toolId,
    ip_hash:    '', // already checked in rate limit; re-hashing optional
    created_at: new Date().toISOString(),
  }).then(({ error: e }) => {
    if (e) console.warn('[generate] usage insert:', e.message)
  })

  // 9. Increment view count via RPC (non-blocking)
  void supabase.rpc('increment_view_count', { tool_id: toolId }).then(({ error: e }) => {
    if (e) console.warn('[generate] increment_view_count:', e.message)
  })

  // 10. Cache the result
  setCache(cacheKey, { output: result.output, model: result.model }, TTL.GENERATE)

  return NextResponse.json({
    output:      result.output,
    model:       result.model,
    attempts:    result.attempts,
    valid:       result.valid,
    variant,
  })
}
