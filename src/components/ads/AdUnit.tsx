'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export interface AdUnitProps {
  slot:        string
  publisherId: string
  format?:     'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  width?:      number  // px — required for non-fluid formats to prevent CLS
  height?:     number  // px
  className?:  string
  label?:      boolean // show "Advertisement" label
}

export default function AdUnit({
  slot,
  publisherId,
  format    = 'auto',
  width,
  height,
  className = '',
  label     = true,
}: AdUnitProps) {
  const insRef           = useRef<HTMLModElement>(null)
  const [loaded, setLoaded]   = useState(false)
  const [error, setError]     = useState(false)
  const initialized            = useRef(false)

  useEffect(() => {
    // Skip in dev mode or if AdSense is not configured
    if (!publisherId || publisherId === 'ca-pub-XXXXXXXX') return
    if (initialized.current) return
    initialized.current = true

    try {
      window.adsbygoogle = window.adsbygoogle ?? []
      window.adsbygoogle.push({})
      setLoaded(true)
    } catch (err) {
      console.error('[AdUnit] adsbygoogle.push failed:', err)
      setError(true)
    }
  }, [publisherId])

  // Collapsed placeholder in dev or on error — no layout shift
  if (!publisherId || publisherId === 'ca-pub-XXXXXXXX' || error) {
    if (process.env.NODE_ENV !== 'development') return null

    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded text-xs text-gray-400 ${className}`}
        style={{ width: width ?? '100%', height: height ?? 90, minHeight: height ?? 90 }}
        aria-hidden
      >
        Ad slot: {slot || 'not configured'}
      </div>
    )
  }

  const containerStyle: React.CSSProperties = {
    display:   'block',
    width:     width  ? `${width}px`  : '100%',
    minHeight: height ? `${height}px` : undefined,
    overflow:  'hidden',
  }

  return (
    <div className={className}>
      {label && (
        <p className="text-center text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
          Advertisement
        </p>
      )}

      {/* Placeholder preserves space before AdSense fills it — prevents CLS */}
      {!loaded && (
        <div
          style={{
            width:      width  ? `${width}px`  : '100%',
            height:     height ? `${height}px` : 90,
            minHeight:  height ?? 90,
            background: '#f9fafb',
          }}
          aria-hidden
        />
      )}

      <ins
        ref={insRef}
        className="adsbygoogle"
        style={containerStyle}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  )
}
