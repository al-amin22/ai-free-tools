'use client'

import { useState, useRef } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { US_STATES } from '@/lib/data/us-states'
import type { FormField } from '@/types/database'

const inputBase =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition disabled:opacity-60 disabled:cursor-not-allowed'

// ─── Individual field renderers ───────────────────────────────────────────────

function FieldLabel({ id, label, required }: { id: string; label: string; required: boolean }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="ml-1 text-red-500" aria-hidden>*</span>}
    </label>
  )
}

function CharCounter({ current, max }: { current: number; max: number }) {
  const pct  = current / max
  const cls  = pct >= 0.9 ? 'text-red-500' : pct >= 0.75 ? 'text-amber-500' : 'text-gray-400'
  return (
    <p className={`mt-1 text-right text-xs ${cls}`}>
      {current} / {max}
    </p>
  )
}

// ─── ToolForm ────────────────────────────────────────────────────────────────

interface ToolFormProps {
  fields:    FormField[]
  onSubmit:  (values: Record<string, string>) => void
  disabled?: boolean
}

export default function ToolForm({ fields, onSubmit, disabled = false }: ToolFormProps) {
  const [values, setValues]     = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, '']))
  )
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const formRef                  = useRef<HTMLFormElement>(null)

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => { const n = { ...e }; delete n[name]; return n })
  }

  function clear() {
    setValues(Object.fromEntries(fields.map((f) => [f.name, ''])))
    setErrors({})
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    for (const field of fields) {
      if (field.required && !values[field.name]?.trim()) {
        next[field.name] = `${field.label} is required`
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(values)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {fields.map((field) => {
        const id  = `field-${field.name}`
        const val = values[field.name] ?? ''
        const err = errors[field.name]

        return (
          <div key={field.name}>
            <FieldLabel id={id} label={field.label} required={field.required} />

            {/* ── textarea ── */}
            {field.type === 'textarea' && (
              <>
                <textarea
                  id={id}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  maxLength={field.maxLength}
                  rows={4}
                  value={val}
                  onChange={(e) => set(field.name, e.target.value)}
                  disabled={disabled}
                  aria-describedby={err ? `${id}-err` : undefined}
                  aria-invalid={!!err}
                  className={`${inputBase} resize-y min-h-[100px] ${err ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                />
                {field.maxLength && (
                  <CharCounter current={val.length} max={field.maxLength} />
                )}
              </>
            )}

            {/* ── select ── */}
            {field.type === 'select' && (
              <select
                id={id}
                name={field.name}
                required={field.required}
                value={val}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={disabled}
                aria-invalid={!!err}
                className={`${inputBase} ${err ? 'border-red-300' : ''}`}
              >
                <option value="">Select…</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {/* ── state_selector — 50 US states ── */}
            {field.type === 'state_selector' && (
              <select
                id={id}
                name={field.name}
                required={field.required}
                value={val}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={disabled}
                aria-invalid={!!err}
                className={`${inputBase} ${err ? 'border-red-300' : ''}`}
              >
                <option value="">Select US state…</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.name}>{s.name}</option>
                ))}
              </select>
            )}

            {/* ── radio group ── */}
            {field.type === 'radio' && field.options && (
              <fieldset className="space-y-2" aria-invalid={!!err}>
                <legend className="sr-only">{field.label}</legend>
                {field.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name={field.name}
                      value={opt}
                      checked={val === opt}
                      onChange={() => set(field.name, opt)}
                      disabled={disabled}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
              </fieldset>
            )}

            {/* ── checkbox (single yes/no) ── */}
            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id={id}
                  name={field.name}
                  checked={val === 'true'}
                  onChange={(e) => set(field.name, String(e.target.checked))}
                  disabled={disabled}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm text-gray-700">{field.placeholder ?? field.label}</span>
              </label>
            )}

            {/* ── text / date / number ── */}
            {(field.type === 'text' || field.type === 'date' || field.type === 'number') && (
              <input
                id={id}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                maxLength={field.maxLength}
                value={val}
                onChange={(e) => set(field.name, e.target.value)}
                disabled={disabled}
                aria-invalid={!!err}
                className={`${inputBase} ${err ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              />
            )}

            {/* Inline error */}
            {err && (
              <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-600">
                {err}
              </p>
            )}
          </div>
        )
      })}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={disabled}
          className="flex-1 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          {disabled ? 'Generating…' : 'Generate Free →'}
        </button>

        <button
          type="button"
          onClick={clear}
          disabled={disabled}
          aria-label="Clear form"
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-60 transition-colors"
        >
          <RotateCcw size={14} aria-hidden />
          Clear
        </button>
      </div>
    </form>
  )
}
