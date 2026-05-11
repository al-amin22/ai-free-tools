import { getAdSenseConfig } from '@/lib/db/config'
import AdLeaderboard  from './AdLeaderboard'
import AdRectangle    from './AdRectangle'
import AdInArticle    from './AdInArticle'
import AdSidebar      from './AdSidebar'

// ─── Placement definitions ────────────────────────────────────────────────────

type Placement = 'top' | 'sidebar' | 'below-output' | 'mid' | 'bottom' | 'in-article'

// Which placements are shown per category — ordered by revenue priority
const CATEGORY_PLACEMENTS: Record<string, Placement[]> = {
  'legal-documents': ['top', 'sidebar', 'below-output', 'bottom'],
  'real-estate':     ['top', 'sidebar', 'below-output', 'bottom'],
  'finance-tax':     ['top', 'sidebar', 'below-output', 'mid', 'bottom'],
  'hr-recruitment':  ['top', 'below-output', 'bottom'],
  'small-business':  ['top', 'below-output', 'bottom'],
  'copywriting-content': ['top', 'below-output', 'bottom'],
  'blog':            ['top', 'in-article', 'bottom'],
  'default':         ['top', 'below-output', 'bottom'],
}

// ─── A/B variant selection ────────────────────────────────────────────────────
// Uses a simple hash of the tool slug to assign one of two layouts consistently
// per tool — same tool always gets same variant, no cookies needed.

type Variant = 'A' | 'B'

function getVariant(toolSlug: string): Variant {
  let hash = 0
  for (let i = 0; i < toolSlug.length; i++) {
    hash = (hash * 31 + toolSlug.charCodeAt(i)) >>> 0
  }
  return hash % 2 === 0 ? 'A' : 'B'
}

// Variant B adds an extra mid-content placement to test whether it lifts RPM
function applyVariant(placements: Placement[], variant: Variant): Placement[] {
  if (variant === 'B' && !placements.includes('mid')) {
    const belowIdx = placements.indexOf('below-output')
    const insert = belowIdx >= 0 ? belowIdx + 1 : placements.length
    return [...placements.slice(0, insert), 'mid', ...placements.slice(insert)]
  }
  return placements
}

// ─── AdManager ────────────────────────────────────────────────────────────────

interface AdManagerProps {
  placement:    Placement
  categorySlug?: string
  toolSlug?:    string
  className?:   string
}

// Server Component — reads AdSense config from DB on every render.
// Each placement renders exactly one ad unit; guards against unknown placements.
export default async function AdManager({
  placement,
  categorySlug = 'default',
  toolSlug     = '',
  className    = '',
}: AdManagerProps) {
  const config  = await getAdSenseConfig()
  const { publisherId, slots } = config

  const variant           = getVariant(toolSlug)
  const allowedPlacements = applyVariant(
    CATEGORY_PLACEMENTS[categorySlug] ?? CATEGORY_PLACEMENTS['default'],
    variant
  )

  // This placement is not configured for this category/variant
  if (!allowedPlacements.includes(placement)) return null

  switch (placement) {
    case 'top':
      return (
        <AdLeaderboard
          slot={slots.top}
          publisherId={publisherId}
          className={`my-4 ${className}`}
        />
      )

    case 'sidebar':
      return (
        <AdSidebar
          slot={slots.sidebar}
          publisherId={publisherId}
          className={className}
        />
      )

    case 'below-output':
    case 'mid':
      return (
        <AdRectangle
          slot={placement === 'mid' ? slots.mid : slots.belowOutput}
          publisherId={publisherId}
          className={`mx-auto my-6 ${className}`}
        />
      )

    case 'in-article':
      return (
        <AdInArticle
          slot={slots.belowOutput}
          publisherId={publisherId}
          className={className}
        />
      )

    case 'bottom':
      return (
        <AdLeaderboard
          slot={slots.bottom}
          publisherId={publisherId}
          className={`my-6 ${className}`}
        />
      )

    default:
      return null
  }
}

// Re-export individual units for one-off usage
export { AdLeaderboard, AdRectangle, AdInArticle, AdSidebar }
export type { Placement, Variant }
