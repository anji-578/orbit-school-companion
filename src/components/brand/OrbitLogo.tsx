import { useId } from 'react'
import { useOrbitStore } from '../../store/orbitStore'

type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

const VER = 'v7'

/** Theme-aware SVG mark — full orbit, never clipped by raster crops. */
function OrbitMarkSvg({ className = '', title }: { className?: string; title?: string }) {
  const theme = useOrbitStore((s) => s.theme)
  const gradId = useId().replace(/:/g, '')
  const ink = theme === 'light' ? '#0B1F44' : '#F8FAFC'
  const royal = '#2563EB'
  const glow = theme === 'light' ? '#3B82F6' : '#38BDF8'
  const tablet = theme === 'light' ? '#E8EEF9' : '#0B1F44'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      className={`block overflow-visible ${className}`}
      role="img"
      aria-label={title || 'Orbit'}
    >
      <defs>
        <linearGradient id={gradId} x1="18" y1="102" x2="102" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor={royal} />
          <stop offset="1" stopColor={glow} />
        </linearGradient>
      </defs>
      <path
        d="M30 84c-8-16-6-36 10-50 14-12 34-16 52-10"
        stroke={ink}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path
        d="M24 88c20 18 48 22 74 8 12-6 20-16 24-26"
        stroke={`url(#${gradId})`}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M32 96c18 12 42 14 64 2"
        stroke={glow}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="94" cy="32" r="5.5" fill={royal} />
      <g fill={ink}>
        <ellipse cx="56" cy="40" rx="9.5" ry="10.5" />
        <path d="M41 92c2-20 9-31 16-35 4-2.5 11-2.5 15.5 1.5 7 5 13.5 16 16 34-9 4.5-20 7-31 5.5-6 0-11.5-2.5-16.5-6z" />
        <path d="M43 60c-5 2.5-9.5 10-10.5 19 5 2.5 9.5 3.5 14 3.5 1-8 2.5-15 5-19.5-3.5-1.5-6-2-8.5-3z" />
      </g>
      <path
        d="M44 66c-1.5 4-2 9-2 13"
        stroke={glow}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <rect x="52" y="60" width="17" height="12" rx="1.8" fill={tablet} stroke={ink} strokeWidth="1.3" />
      <path d="M55 63.5h11M55 66.5h8" stroke={glow} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M78 46l1.3 3 3 1.3-3 1.3-1.3 3-1.3-3-3-1.3 3-1.3 1.3-3z" fill={glow} />
      <path d="M87 53l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2z" fill={ink} />
      <path d="M82 40l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7.7-1.5z" fill={royal} />
    </svg>
  )
}

/** Official Orbit brand — theme-aware logos (SVG mark + PNG hero). */
export function OrbitLogo({
  variant = 'lockup',
  className = '',
  markClassName = '',
  showTagline = true,
}: OrbitLogoProps) {
  const theme = useOrbitStore((s) => s.theme)
  const logo = theme === 'light' ? `/brand/orbit-logo-light.png?${VER}` : `/brand/orbit-logo-dark.png?${VER}`
  const wordColor = theme === 'light' ? 'text-[#0B1F44]' : 'text-[#F8FAFC]'
  const tagMuted = theme === 'light' ? 'text-slate-500' : 'text-slate-400'

  if (variant === 'mark') {
    return <OrbitMarkSvg className={`${markClassName || 'h-8 w-8'} ${className}`} title="Orbit" />
  }

  if (variant === 'hero') {
    return (
      <div className={`relative flex justify-center overflow-visible bg-transparent ${className}`}>
        <div
          className="pointer-events-none absolute inset-[-18%] rounded-full opacity-40 blur-3xl transition-opacity duration-500"
          style={{
            background:
              theme === 'light'
                ? 'radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%)'
                : 'radial-gradient(circle, rgba(56,189,248,0.28), transparent 68%)',
          }}
          aria-hidden
        />
        <img
          src={logo}
          alt="Orbit — Your learning. Our orbit."
          className="relative block h-auto w-[140px] sm:w-[160px] object-contain object-center bg-transparent overflow-visible transition-[filter] duration-500"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 min-w-0 overflow-visible bg-transparent ${className}`}>
      <OrbitMarkSvg className={`h-9 w-9 shrink-0 ${markClassName}`} />
      <div className="min-w-0 leading-tight">
        <div className={`font-brand text-[1.15rem] tracking-[-0.02em] leading-none ${wordColor}`}>Orbit</div>
        {showTagline ? (
          <div className={`mt-0.5 text-[7px] font-semibold uppercase tracking-[0.14em] truncate ${tagMuted}`}>
            Your learning. <span className="text-[#2563EB]">Our orbit.</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function OrbitMark({ className = '', title = 'Orbit' }: { className?: string; title?: string }) {
  return <OrbitMarkSvg className={className || 'h-8 w-8'} title={title} />
}
