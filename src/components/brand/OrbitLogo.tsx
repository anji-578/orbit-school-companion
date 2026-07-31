type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

/** Transparent brand assets (navy plate removed). Cache-bust query for deploys. */
const LOGO = '/brand/orbit-logo.png?v=3'
const ICON = '/brand/orbit-icon.png?v=3'

/** Official Orbit brand — transparent PNGs that sit on the app background. */
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
        className={`block object-contain bg-transparent ${markClassName || 'h-9 w-9'} ${className}`}
        draggable={false}
      />
    )
  }

  if (variant === 'hero') {
    return (
      <div className={`flex justify-center bg-transparent ${className}`}>
        <img
          src={LOGO}
          alt="Orbit — Your learning. Our orbit."
          className="block h-auto w-[min(100%,200px)] sm:w-[220px] object-contain bg-transparent"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 min-w-0 bg-transparent ${className}`}>
      <img
        src={ICON}
        alt=""
        className={`block h-10 w-10 shrink-0 object-contain bg-transparent ${markClassName}`}
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

export function OrbitMark({ className = '', title = 'Orbit' }: { className?: string; title?: string }) {
  return (
    <img
      src={ICON}
      alt={title}
      className={`block object-contain bg-transparent ${className || 'h-9 w-9'}`}
      draggable={false}
    />
  )
}
