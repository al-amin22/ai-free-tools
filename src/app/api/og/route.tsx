import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Cache each unique OG image for 24 hours at the CDN
export const revalidate = 86400

const SITE_NAME = 'AI Free Tools'
const SITE_URL  = 'aifreetools.us'

// Category color map — matches seed-categories.sql
const CATEGORY_COLORS: Record<string, { bg: string; accent: string }> = {
  'legal-documents':     { bg: '#1E3A8A', accent: '#3B82F6' },
  'real-estate':         { bg: '#134E4A', accent: '#14B8A6' },
  'hr-recruitment':      { bg: '#4C1D95', accent: '#8B5CF6' },
  'finance-tax':         { bg: '#78350F', accent: '#F59E0B' },
  'small-business':      { bg: '#14532D', accent: '#22C55E' },
  'copywriting-content': { bg: '#7F1D1D', accent: '#EF4444' },
}

const DEFAULT_COLORS = { bg: '#1E3A8A', accent: '#3B82F6' }

function truncate(str: string, max: number) {
  return str.length <= max ? str : str.slice(0, max - 1) + '…'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const title    = truncate(searchParams.get('title')    ?? SITE_NAME, 60)
  const tagline  = truncate(searchParams.get('tagline')  ?? 'Free AI Tool — United States', 90)
  const category = searchParams.get('category') ?? ''
  const catSlug  = searchParams.get('catSlug')  ?? ''
  const icon     = searchParams.get('icon')     ?? '⚡'

  const colors = CATEGORY_COLORS[catSlug] ?? DEFAULT_COLORS

  return new ImageResponse(
    (
      <div
        style={{
          display:         'flex',
          flexDirection:   'column',
          width:           '100%',
          height:          '100%',
          backgroundColor: colors.bg,
          padding:         '60px 72px',
          fontFamily:      'system-ui, sans-serif',
          position:        'relative',
          overflow:        'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div style={{
          position:        'absolute',
          top:             -120,
          right:           -120,
          width:           400,
          height:          400,
          borderRadius:    '50%',
          backgroundColor: colors.accent,
          opacity:         0.12,
          display:         'flex',
        }} />
        <div style={{
          position:        'absolute',
          bottom:          -80,
          left:            -80,
          width:           280,
          height:          280,
          borderRadius:    '50%',
          backgroundColor: colors.accent,
          opacity:         0.08,
          display:         'flex',
        }} />

        {/* Site badge */}
        <div style={{
          display:         'flex',
          alignItems:      'center',
          gap:             10,
          marginBottom:    'auto',
        }}>
          <div style={{
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            width:           40,
            height:          40,
            borderRadius:    10,
            backgroundColor: colors.accent,
            fontSize:        20,
          }}>
            ⚡
          </div>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: 600 }}>
            {SITE_NAME}
          </span>
        </div>

        {/* Category pill */}
        {category && (
          <div style={{
            display:         'flex',
            alignItems:      'center',
            gap:             6,
            marginBottom:    20,
          }}>
            <div style={{
              display:         'flex',
              alignItems:      'center',
              gap:             6,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius:    20,
              paddingLeft:     12,
              paddingRight:    14,
              paddingTop:      5,
              paddingBottom:   5,
              fontSize:        14,
              color:           'rgba(255,255,255,0.8)',
              fontWeight:      500,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {category}
            </div>
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize:    title.length > 40 ? 44 : 52,
          fontWeight:  800,
          color:       '#FFFFFF',
          lineHeight:  1.15,
          marginBottom: 20,
          maxWidth:    900,
        }}>
          {title}
        </div>

        {/* Tagline */}
        <div style={{
          fontSize:  22,
          color:     'rgba(255,255,255,0.65)',
          lineHeight: 1.4,
          maxWidth:  760,
          marginBottom: 32,
        }}>
          {tagline}
        </div>

        {/* Footer row */}
        <div style={{
          display:     'flex',
          alignItems:  'center',
          gap:         24,
          marginTop:   'auto',
        }}>
          {['No Sign Up', '100% Free', 'AI Powered', 'US Focused'].map((badge) => (
            <div
              key={badge}
              style={{
                display:         'flex',
                alignItems:      'center',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius:    8,
                paddingLeft:     12,
                paddingRight:    12,
                paddingTop:      5,
                paddingBottom:   5,
                fontSize:        14,
                color:           'rgba(255,255,255,0.75)',
                fontWeight:      500,
              }}
            >
              {badge}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
            {SITE_URL}
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  )
}
