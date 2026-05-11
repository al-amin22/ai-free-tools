'use client'

import { useEffect, useRef } from 'react'
import AdUnit from './AdUnit'

interface AdSidebarProps {
  slot:        string
  publisherId: string
  className?:  string
  // Distance from top when sticky, defaults to 80px (nav height)
  topOffset?:  number
}

// 300x600 half-page sidebar ad with sticky behaviour.
// Uses IntersectionObserver to avoid sticking when the footer is visible.
export default function AdSidebar({
  slot,
  publisherId,
  className  = '',
  topOffset  = 80,
}: AdSidebarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Unstick when bottom of sidebar hits the viewport floor
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        el.style.position = entry.isIntersecting ? 'sticky' : 'relative'
      },
      { threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={`${className}`}
      style={{
        position:  'sticky',
        top:       topOffset,
        width:     300,
        minHeight: 600,
        alignSelf: 'flex-start',
      }}
    >
      <AdUnit
        slot={slot}
        publisherId={publisherId}
        format="vertical"
        width={300}
        height={600}
        label
      />
    </div>
  )
}
