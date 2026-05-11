import { ShieldCheck, Infinity, Zap, Lock, EyeOff } from 'lucide-react'

interface Badge {
  icon:  React.ReactNode
  label: string
  sub?:  string
}

const BADGES: Badge[] = [
  {
    icon:  <ShieldCheck size={16} className="text-green-500" />,
    label: 'No Sign Up Required',
    sub:   'Use instantly',
  },
  {
    icon:  <Infinity size={16} className="text-blue-500" />,
    label: '100% Free Forever',
    sub:   'No hidden fees',
  },
  {
    icon:  <Zap size={16} className="text-purple-500" />,
    label: 'AI Powered',
    sub:   'Groq & Gemini',
  },
  {
    icon:  <Lock size={16} className="text-gray-500" />,
    label: 'HTTPS Secured',
    sub:   '256-bit encryption',
  },
  {
    icon:  <EyeOff size={16} className="text-orange-500" />,
    label: 'No Data Stored',
    sub:   'Privacy first',
  },
]

type Layout = 'row' | 'grid'

interface TrustBadgesProps {
  layout?:  Layout
  subset?:  number   // show only first N badges
  compact?: boolean  // hide sub-labels
  className?: string
}

export default function TrustBadges({
  layout    = 'row',
  subset,
  compact   = false,
  className = '',
}: TrustBadgesProps) {
  const badges = subset ? BADGES.slice(0, subset) : BADGES

  const containerClass =
    layout === 'grid'
      ? `grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`
      : `flex flex-wrap justify-center gap-3 ${className}`

  return (
    <ul className={containerClass} aria-label="Trust signals">
      {badges.map((badge) => (
        <li
          key={badge.label}
          className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm"
        >
          <span className="shrink-0">{badge.icon}</span>
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-tight">
              {badge.label}
            </p>
            {!compact && badge.sub && (
              <p className="text-[10px] text-gray-400 leading-tight">{badge.sub}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
