'use client'

import { useState } from 'react'
import type { FormField } from '@/types/database'
import ToolForm      from '@/components/tools/ToolForm'
import ToolOutput    from '@/components/tools/ToolOutput'
import FeedbackWidget from '@/components/tools/FeedbackWidget'
import LoadingState  from '@/components/ui/LoadingState'
import ErrorMessage  from '@/components/ui/ErrorMessage'

interface ToolInteractiveProps {
  toolId:       string
  toolName:     string
  aiModel:      string
  formFields:   FormField[]
  categorySlug: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ToolInteractive({
  toolId,
  toolName,
  aiModel,
  formFields,
  categorySlug,
}: ToolInteractiveProps) {
  const [status,    setStatus] = useState<Status>('idle')
  const [output,    setOutput] = useState('')
  const [errorCode, setError]  = useState('unknown')

  const isLegal =
    categorySlug === 'legal-documents' || categorySlug === 'real-estate'

  async function handleSubmit(values: Record<string, string>) {
    setStatus('loading')
    setOutput('')
    setError('unknown')

    try {
      const res = await fetch('/api/tools/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ toolId, inputs: values }),
      })

      if (res.status === 429) { setError('rate_limit'); setStatus('error'); return }
      if (!res.ok)            { setError('ai_failed');  setStatus('error'); return }

      const data = await res.json()
      if (!data.output) { setError('ai_failed'); setStatus('error'); return }

      setOutput(data.output)
      setStatus('success')
    } catch {
      setError('network')
      setStatus('error')
    }
  }

  function reset() {
    setStatus('idle')
    setOutput('')
  }

  return (
    <div id="tool-form" className="space-y-6">

      {/* Form — always visible until success so user can regenerate */}
      {status !== 'success' && (
        <ToolForm
          fields={formFields}
          onSubmit={handleSubmit}
          disabled={status === 'loading'}
        />
      )}

      <LoadingState visible={status === 'loading'} model={aiModel} />

      {status === 'error' && (
        <ErrorMessage code={errorCode} onRetry={reset} />
      )}

      {status === 'success' && output && (
        <div className="space-y-4">
          <ToolOutput
            text={output}
            toolName={toolName}
            format={isLegal ? 'legal' : 'plain'}
          />

          <FeedbackWidget toolId={toolId} showAfterMs={3000} />

          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            ← Generate new
          </button>
        </div>
      )}
    </div>
  )
}
