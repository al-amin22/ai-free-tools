'use client'

import { useRef } from 'react'
import { Printer, Share2, CheckCircle } from 'lucide-react'
import CopyButton     from '@/components/ui/CopyButton'
import DownloadButton from '@/components/ui/DownloadButton'

// ─── Legal document formatting ────────────────────────────────────────────────
// Highlights ALL-CAPS section headers and underline-style signature lines

function LegalFormatter({ text }: { text: string }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // ALL-CAPS header or "ARTICLE X" / "SECTION X"
        if (/^[A-Z][A-Z\s\d:&-]{4,}$/.test(trimmed) || /^(ARTICLE|SECTION|WHEREAS|NOW THEREFORE)\b/i.test(trimmed)) {
          return (
            <p key={i} className="font-bold text-gray-900 mt-4 first:mt-0">
              {line}
            </p>
          )
        }

        // Signature / blank line
        if (/^_{4,}/.test(trimmed) || /^Signature/i.test(trimmed)) {
          return (
            <p key={i} className="mt-4 text-gray-500 border-b border-gray-400 pb-1 w-64">
              {line || ' '}
            </p>
          )
        }

        // Numbered list item
        if (/^\d+\./.test(trimmed)) {
          return (
            <p key={i} className="pl-4 text-gray-800">
              {line}
            </p>
          )
        }

        // Blank line → spacer
        if (!trimmed) return <div key={i} className="h-2" aria-hidden />

        return <p key={i} className="text-gray-800">{line}</p>
      })}
    </div>
  )
}

// ─── Plain text formatter ─────────────────────────────────────────────────────

function PlainFormatter({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap text-gray-800">
      {text}
    </div>
  )
}

// ─── Print helper ─────────────────────────────────────────────────────────────

function printContent(text: string, title: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6;
               margin: 1in; color: #000; }
        pre  { white-space: pre-wrap; font-family: inherit; }
      </style>
    </head>
    <body><pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
  win.close()
}

// ─── Share helper (Web Share API with clipboard fallback) ─────────────────────

async function shareOutput(text: string, title: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text: text.slice(0, 300) + '…' })
      return true
    } catch { /* user dismissed */ }
  }
  // Fallback: copy link
  await navigator.clipboard.writeText(window.location.href)
  return false
}

// ─── ToolOutput ───────────────────────────────────────────────────────────────

type OutputFormat = 'legal' | 'plain'

interface ToolOutputProps {
  text:       string
  toolName:   string
  format?:    OutputFormat
  className?: string
}

export default function ToolOutput({
  text,
  toolName,
  format    = 'plain',
  className = '',
}: ToolOutputProps) {
  const filename = toolName.toLowerCase().replace(/\s+/g, '-')

  // Detect legal format from content if not specified
  const effectiveFormat: OutputFormat =
    format === 'plain' && /WHEREAS|ARTICLE\s+\d|NOW THEREFORE/i.test(text)
      ? 'legal'
      : format

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {/* Header toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle size={13} className="text-green-500" aria-hidden />
          <span>Output ready</span>
          {effectiveFormat === 'legal' && (
            <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-blue-600 font-medium">
              Legal format
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => printContent(text, toolName)}
            aria-label="Print document"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Printer size={12} aria-hidden />
            Print
          </button>
          <button
            onClick={() => shareOutput(text, toolName)}
            aria-label="Share or copy link"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Share2 size={12} aria-hidden />
            Share
          </button>
        </div>
      </div>

      {/* Document body */}
      <div
        className="p-6 text-sm leading-relaxed font-mono"
        aria-live="polite"
        aria-label="Generated document"
        role="region"
      >
        {effectiveFormat === 'legal'
          ? <LegalFormatter text={text} />
          : <PlainFormatter text={text} />
        }
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3">
        <CopyButton text={text} label="Copy All" />
        <DownloadButton content={text} filename={filename} format="txt" />
        <DownloadButton content={text} filename={filename} format="docx" />
        <span className="ml-auto text-xs text-gray-400">
          {text.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  )
}
