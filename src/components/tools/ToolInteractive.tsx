'use client'

import { useState } from 'react'
import type { FormField } from '@/types/database'
import LoadingState  from '@/components/ui/LoadingState'
import ErrorMessage  from '@/components/ui/ErrorMessage'
import CopyButton    from '@/components/ui/CopyButton'
import DownloadButton from '@/components/ui/DownloadButton'

// ─── Dynamic form renderer ────────────────────────────────────────────────────

function ToolForm({
  fields,
  onSubmit,
  disabled,
}: {
  fields:    FormField[]
  onSubmit:  (values: Record<string, string>) => void
  disabled:  boolean
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, '']))
  )

  function set(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {fields.map((field) => {
        const id = `field-${field.name}`
        const baseClass =
          'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition disabled:opacity-60'

        return (
          <div key={field.name}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500" aria-hidden>*</span>}
            </label>

            {field.type === 'textarea' && (
              <textarea
                id={id}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                rows={4}
                value={values[field.name] ?? ''}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={disabled}
                className={`${baseClass} resize-y min-h-[100px]`}
              />
            )}

            {field.type === 'select' && (
              <select
                id={id}
                name={field.name}
                required={field.required}
                value={values[field.name] ?? ''}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={disabled}
                className={baseClass}
              >
                <option value="">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {(field.type === 'text' || field.type === 'date' || field.type === 'number') && (
              <input
                id={id}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                value={values[field.name] ?? ''}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={disabled}
                className={baseClass}
              />
            )}
          </div>
        )
      })}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
      >
        {disabled ? 'Generating…' : 'Generate Free →'}
      </button>
    </form>
  )
}

// ─── Output display ───────────────────────────────────────────────────────────

function ToolOutput({ text }: { text: string }) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-6 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono shadow-sm"
      aria-live="polite"
      aria-label="Generated output"
    >
      {text}
    </div>
  )
}

// ─── ToolInteractive ─────────────────────────────────────────────────────────

interface ToolInteractiveProps {
  toolId:     string
  toolName:   string
  aiModel:    string
  formFields: FormField[]
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
  const [status, setStatus]   = useState<Status>('idle')
  const [output, setOutput]   = useState('')
  const [errorCode, setError] = useState('unknown')

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

  function reset() { setStatus('idle'); setOutput('') }

  return (
    <div id="tool-form" className="space-y-6">

      {/* Form — hide after success */}
      {status !== 'success' && (
        <ToolForm
          fields={formFields}
          onSubmit={handleSubmit}
          disabled={status === 'loading'}
        />
      )}

      {/* Loading animation */}
      <LoadingState visible={status === 'loading'} model={aiModel} />

      {/* Error */}
      {status === 'error' && (
        <ErrorMessage code={errorCode} onRetry={reset} />
      )}

      {/* Output + actions */}
      {status === 'success' && output && (
        <div className="space-y-4">
          <ToolOutput text={output} />

          <div className="flex flex-wrap items-center gap-3">
            <CopyButton text={output} label="Copy Output" />
            <DownloadButton
              content={output}
              filename={toolName.toLowerCase().replace(/\s+/g, '-')}
              format="txt"
            />
            <DownloadButton
              content={output}
              filename={toolName.toLowerCase().replace(/\s+/g, '-')}
              format="docx"
            />
            <button
              onClick={reset}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              ← Generate new
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
