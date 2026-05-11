import AdUnit from './AdUnit'

interface AdInArticleProps {
  slot:        string
  publisherId: string
  className?:  string
}

// Fluid in-article format — AdSense picks height automatically.
// Reserve 280px minimum so the page doesn't reflow when the ad loads.
export default function AdInArticle({ slot, publisherId, className = '' }: AdInArticleProps) {
  return (
    <div className={`my-6 ${className}`} style={{ minHeight: 280 }}>
      <AdUnit
        slot={slot}
        publisherId={publisherId}
        format="fluid"
        label
      />
    </div>
  )
}
