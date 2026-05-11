'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text:       string
  label?:     string
  className?: string
}

export default function CopyButton({
  text,
  label     = 'Copy',
  className = '',
}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      // Fallback for browsers that block clipboard without user gesture
      const el = document.createElement('textarea')
      el.value = text
      el.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const isCopied = state === 'copied'

  return (
    <button
      onClick={handleCopy}
      aria-label={isCopied ? 'Copied!' : `Copy ${label}`}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        isCopied
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      } ${className}`}
    >
      {isCopied ? (
        <>
          <Check size={15} className="text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy size={15} />
          {label}
        </>
      )}
    </button>
  )
}
