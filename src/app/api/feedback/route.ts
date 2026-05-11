import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient }           from '@/lib/supabase/server'
import { updateSatisfactionScore }       from '@/lib/db/tools'

const ALERT_THRESHOLD = 85   // insert ai_jobs alert when score drops below this

export async function POST(request: NextRequest) {
  // 1. Parse body
  let toolId: string
  let rating: 'thumbs_up' | 'thumbs_down'
  let reason: string | undefined

  try {
    const body = await request.json()
    toolId = body.toolId
    rating = body.rating
    reason = body.reason

    if (!toolId || !['thumbs_up', 'thumbs_down'].includes(rating)) {
      throw new Error('invalid payload')
    }
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 2. Save feedback row
  const { error: fbErr } = await supabase.from('feedback').insert({
    tool_id:    toolId,
    rating,
    reason:     reason ?? null,
    created_at: new Date().toISOString(),
  })

  if (fbErr) {
    console.error('[feedback] insert error:', fbErr)
    // Still return 200 — feedback is non-critical to the user experience
    return NextResponse.json({ ok: false })
  }

  // 3. Recompute satisfaction score
  let newScore: number | null = null
  try {
    newScore = await updateSatisfactionScore(toolId)
  } catch (err) {
    console.error('[feedback] updateSatisfactionScore:', err)
  }

  // 4. Alert if score drops below threshold
  if (newScore !== null && newScore < ALERT_THRESHOLD) {
    void supabase.from('ai_jobs').insert({
      job_type:   'quality_alert',
      status:     'pending',
      payload:    { tool_id: toolId, satisfaction_score: newScore, triggered_by: 'feedback' },
      created_at: new Date().toISOString(),
    }).then(({ error: e }) => {
      if (e) console.warn('[feedback] ai_jobs insert:', e.message)
    })
  }

  return NextResponse.json({ ok: true, score: newScore })
}
