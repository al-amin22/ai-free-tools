import AdUnit from './AdUnit'

interface AdRectangleProps {
  slot:        string
  publisherId: string
  className?:  string
}

// Standard 336x280 medium rectangle — highest CTR for most categories
export default function AdRectangle({ slot, publisherId, className = '' }: AdRectangleProps) {
  return (
    <AdUnit
      slot={slot}
      publisherId={publisherId}
      format="rectangle"
      width={336}
      height={280}
      label
      className={className}
    />
  )
}
