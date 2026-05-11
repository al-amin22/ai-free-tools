'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

// Estimated duration in seconds per AI model
const MODEL_DURATIONS: Record<string, number> = {
  'groq-8b':       6,
  'groq-70b':      12,
  'gemini-flash':  20,
}

const STEPS = [
  { label: 'Analyzing your inputs',    pct: 15 },
  { label: 'Generating document',      pct: 60 },
  { label: 'Applying US requirements', pct: 85 },
  { label: 'Finalizing',               pct: 95 },
]

interface LoadingStateProps {
  model?:    string   // ai_model value from tool row
  visible:   boolean
  className?: string
}

export default function LoadingState({
  model     = 'groq-8b',
  visible,
  className = '',
}: LoadingStateProps) {
  const totalSeconds              = MODEL_DURATIONS[model] ?? 10
  const [elapsed, setElapsed]     = useState(0)
  const [stepIdx, setStepIdx]     = useState(0)

  useEffect(() => {
    if (!visible) {
      setElapsed(0)
      setStepIdx(0)
      return
    }

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1
        // Advance step label based on elapsed fraction
        const fraction = next / totalSeconds
        const newStep  = STEPS.findLastIndex((s) => fraction * 100 >= s.pct)
        setStepIdx(Math.max(0, newStep))
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [visible, totalSeconds])

  if (!visible) return null

  // Cap bar at 95% — the final jump to 100% happens when the parent unmounts this
  const barPct = Math.min((elapsed / totalSeconds) * 100, 95)
  const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed))
  const currentStep = STEPS[Math.min(stepIdx, STEPS.length - 1)]

  return (
    <div
      className={`flex flex-col items-center gap-4 py-10 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Generating document"
    >
      <Loader2 size={32} className="text-blue-500 animate-spin" />

      <div className="text-center">
        <p className="text-sm font-medium text-gray-800">{currentStep.label}…</p>
        <p className="text-xs text-gray-400 mt-1">
          {remaining > 0 ? `About ${remaining}s remaining` : 'Almost done…'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-linear"
          style={{ width: `${barPct}%` }}
          aria-valuenow={Math.round(barPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>

      {/* Step labels */}
      <ol className="flex gap-6" aria-hidden>
        {STEPS.map((s, i) => (
          <li
            key={s.label}
            className={`text-[10px] transition-colors ${
              i <= stepIdx ? 'text-blue-500 font-medium' : 'text-gray-300'
            }`}
          >
            {s.label.split(' ')[0]}
          </li>
        ))}
      </ol>
    </div>
  )
}
