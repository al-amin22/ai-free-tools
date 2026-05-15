'use client'

import { useEffect } from 'react'

type AdSlot = 'leaderboard' | 'rectangle' | 'inArticle' | 'sidebar'

const AD_SLOTS: Record<AdSlot, string> = {
  leaderboard: process.env.NEXT_PUBLIC_AD_LEADERBOARD ?? '',
  rectangle: process.env.NEXT_PUBLIC_AD_RECTANGLE ?? '',
  inArticle: process.env.NEXT_PUBLIC_AD_IN_ARTICLE ?? '',
  sidebar: process.env.NEXT_PUBLIC_AD_SIDEBAR ?? '',
}

const AD_SIZES: Record<AdSlot, { style: React.CSSProperties; format: string }> = {
  leaderboard: { style: { display: 'block', width: 728, height: 90 }, format: '' },
  rectangle:   { style: { display: 'block', width: 300, height: 250 }, format: '' },
  inArticle:   { style: { display: 'block', textAlign: 'center' }, format: 'fluid' },
  sidebar:     { style: { display: 'block', width: 300, height: 600 }, format: '' },
}

interface AdSenseProps {
  slot: AdSlot
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdSense({ slot, className }: AdSenseProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_ID
  const slotId = AD_SLOTS[slot]

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not loaded (dev / ad-blocker)
    }
  }, [])

  if (!publisherId || !slotId || process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs ${className ?? ''}`}
        style={AD_SIZES[slot].style}
      >
        Ad: {slot}
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={AD_SIZES[slot].style}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format={AD_SIZES[slot].format || undefined}
        data-full-width-responsive="true"
      />
    </div>
  )
}
