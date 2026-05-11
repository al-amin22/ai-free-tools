'use client'

import { useEffect, useRef, useState } from 'react'
import { Users } from 'lucide-react'

// Formats a number with locale commas: 50000 → "50,000"
function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

// Animates from `from` to `to` over `duration` ms using requestAnimationFrame
function useCountUp(target: number, duration = 1200): number {
  const [value, setValue]   = useState(target)
  const start               = useRef<number | null>(null)
  const from                = useRef(0)

  useEffect(() => {
    from.current = 0
    start.current = null

    const step = (ts: number) => {
      if (!start.current) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(from.current + (target - from.current) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [target, duration])

  return value
}

interface UsageCounterProps {
  // Pass the real count from DB (fetched server-side, passed as prop)
  count:      number
  // Extra context so SSR and client start from the same number
  className?: string
}

export default function UsageCounter({ count, className = '' }: UsageCounterProps) {
  const animated = useCountUp(count)

  return (
    <div
      className={`flex items-center justify-center gap-2 text-sm text-gray-600 ${className}`}
    >
      <Users size={15} className="text-blue-500 shrink-0" />
      <span>
        Trusted by{' '}
        <strong className="text-gray-900 font-semibold">
          {formatCount(animated)}+
        </strong>{' '}
        US professionals
      </span>
    </div>
  )
}

// ─── Server helper — fetch count and pass to the component ───────────────────
// Usage in a Server Component:
//   import { getTotalUsageCount } from '@/components/ui/UsageCounter'
//   const count = await getTotalUsageCount()
//   <UsageCounter count={count} />

export async function getTotalUsageCount(): Promise<number> {
  try {
    // Inline import so tree-shaking removes this from client bundles
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('tool_usage')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    // Add a base offset so new sites don't start at zero
    return (count ?? 0) + 50_000
  } catch {
    return 50_000
  }
}
