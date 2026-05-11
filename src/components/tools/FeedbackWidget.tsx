'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

const REASONS = [
  'Too short',
  'Missing information',
  'Wrong format',
  'Not what I expected',
  'Other',
]

interface FeedbackWidgetProps {
  toolId:      string
  showAfterMs?: number   // delay before widget appears; default 3000
  className?:  string
}

type Rating = 'thumbs_up' | 'thumbs_down'
type Step   = 'hidden' | 'prompt' | 'reason' | 'done'

export default function FeedbackWidget({
  toolId,
  showAfterMs = 3000,
  className   = '',
}: FeedbackWidgetProps) {
  const [step,   setStep]   = useState<Step>('hidden')
  const [reason, setReason] = useState('')
  const [busy,   setBusy]   = useState(false)

  // Appear after delay
  useEffect(() => {
    const t = setTimeout(() => setStep('prompt'), showAfterMs)
    return () => clearTimeout(t)
  }, [showAfterMs])

  async function sendFeedback(rating: Rating, selectedReason?: string) {
    setBusy(true)
    try {
      await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ toolId, rating, reason: selectedReason }),
      })
    } catch {
      // Non-critical
    } finally {
      setBusy(false)
      setStep('done')
    }
  }

  function handleThumbsUp() {
    sendFeedback('thumbs_up')
  }

  function handleThumbsDown() {
    setStep('reason')
  }

  function handleReason() {
    sendFeedback('thumbs_down', reason || 'Not what I expected')
  }

  if (step === 'hidden') return null

  return (
    <div
      className={`transition-all duration-300 ${className}`}
      aria-label="Feedback"
    >
      {step === 'prompt' && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Was this helpful?</span>

          <button
            onClick={handleThumbsUp}
            disabled={busy}
            aria-label="Yes, helpful"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-60 transition-all"
          >
            <ThumbsUp size={13} aria-hidden />
            Yes
          </button>

          <button
            onClick={handleThumbsDown}
            disabled={busy}
            aria-label="No, not helpful"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60 transition-all"
          >
            <ThumbsDown size={13} aria-hidden />
            No
          </button>
        </div>
      )}

      {step === 'reason' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">What went wrong?</span>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            aria-label="Reason for negative feedback"
          >
            <option value="">Select reason…</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button
            onClick={handleReason}
            disabled={busy}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-60 transition-colors"
          >
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <p className="text-xs text-green-600 font-medium">
          Thanks for your feedback — we&apos;ll keep improving!
        </p>
      )}
    </div>
  )
}
