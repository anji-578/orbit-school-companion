type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

const LOGO = '/brand/orbit-logo.png'
const ICON = '/brand/orbit-icon.png'

/** Official Orbit brand assets from finalized logo. */
export function OrbitLogo({
  variant = 'lockup',
  className = '',
  markClassName = '',
  showTagline = true,
}: OrbitLogoProps) {
  if (variant === 'mark') {
    return (
      <img
        src={ICON}
        alt="Orbit"
        className={`object-contain ${markClassName || 'h-9 w-9'} ${className}`}
        draggable={false}
      />
    )
  }

  if (variant === 'hero') {
    return (
      <div className={`flex justify-center ${className}`}>
        <img
          src={LOGO}
          alt="Orbit — Your learning. Our orbit."
          className="h-auto w-[min(100%,220px)] sm:w-[240px] object-contain drop-shadow-[0_16px_48px_rgba(59,130,246,0.28)]"
          draggable={false}
        />
      </div>
    )
  }

  // Compact header/sidebar: icon + wordmark (logo already includes tagline on hero)
  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src={ICON}
        alt=""
        className={`h-10 w-10 shrink-0 object-contain ${markClassName}`}
        draggable={false}
      />
      <div className="min-w-0 leading-tight">
        <div className="font-brand text-[1.35rem] text-[#B8D4FF] tracking-[-0.02em] leading-none">Orbit</div>
        {showTagline ? (
          <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-300 truncate">
            Your learning. Our orbit.
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Small icon-only mark for tight UI spots. */
export function OrbitMark({ className = '', title = 'Orbit' }: { className?: string; title?: string }) {
  return (
    <img src={ICON} alt={title} className={`object-contain ${className || 'h-9 w-9'}`} draggable={false} />
  )
}
