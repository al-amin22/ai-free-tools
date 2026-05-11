'use client'

import { useEffect, useState } from 'react'
import AdUnit from './AdUnit'

interface AdLeaderboardProps {
  slot:        string
  publisherId: string
  className?:  string
}

// 728x90 on desktop, 320x50 on mobile — switches based on viewport width
export default function AdLeaderboard({ slot, publisherId, className = '' }: AdLeaderboardProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div
      className={`flex justify-center ${className}`}
      // Reserve the exact final space so no reflow when the ad fills in
      style={{ minHeight: isMobile ? 50 : 90, minWidth: isMobile ? 320 : 728 }}
    >
      <AdUnit
        slot={slot}
        publisherId={publisherId}
        format="horizontal"
        width={isMobile ? 320 : 728}
        height={isMobile ? 50 : 90}
        label
      />
    </div>
  )
}
