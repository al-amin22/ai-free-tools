'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface FeedbackWidgetProps {
  toolId:    string
  className?: string
}

type Rating = 'thumbs_up' | 'thumbs_down'
type State  = 'idle' | 'submitting' | 'done'

export default function FeedbackWidget({ toolId, className = '' }: FeedbackWidgetProps) {
  const [picked, setPicked] = useState<Rating | null>(null)
  const [uiState, setUi]    = useState<State>('idle')

  async function submit(rating: Rating) {
    if (uiState !== 'idle') return
    setPicked(rating)
    setUi('submitting')

    try {
      await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ toolId, rating }),
      })
    } catch {
      // Non-critical — user already saw the visual feedback
    } finally {
      setUi('done')
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="Was this helpful?">
      <span className="text-xs text-gray-500 font-medium">Was this helpful?</span>

      {uiState === 'done' ? (
        <span className="text-xs text-green-600 font-medium">
          {picked === 'thumbs_up' ? '👍 Thanks for your feedback!' : '👎 We\'ll keep improving!'}
        </span>
      ) : (
        <>
          <button
            onClick={() => submit('thumbs_up')}
            disabled={uiState === 'submitting'}
            aria-label="Yes, this was helpful"
            aria-pressed={picked === 'thumbs_up'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              picked === 'thumbs_up'
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <ThumbsUp size={13} aria-hidden />
            Yes
          </button>

          <button
            onClick={() => submit('thumbs_down')}
            disabled={uiState === 'submitting'}
            aria-label="No, this was not helpful"
            aria-pressed={picked === 'thumbs_down'}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              picked === 'thumbs_down'
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <ThumbsDown size={13} aria-hidden />
            No
          </button>
        </>
      )}
    </div>
  )
}
