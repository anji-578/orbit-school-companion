type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

const LOGO = '/brand/orbit-logo.png?v=5'
const ICON = '/brand/orbit-icon.png?v=5'


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
        className={`block object-contain bg-transparent ${markClassName || 'h-8 w-8'} ${className}`}
        draggable={false}
      />
    )
  }

  if (variant === 'hero') {
    return (
      <div className={`relative flex justify-center bg-transparent ${className}`}>
        <div
          className="pointer-events-none absolute inset-[-20%] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.35), transparent 68%)' }}
          aria-hidden
        />
        <img
          src={LOGO}
          alt="Orbit — Your learning. Our orbit."
          className="relative block h-auto w-[128px] sm:w-[148px] object-contain bg-transparent"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 min-w-0 bg-transparent ${className}`}>
      <img
        src={ICON}
        alt=""
        className={`block h-8 w-8 shrink-0 object-contain bg-transparent ${markClassName}`}
        draggable={false}
      />
      <div className="min-w-0 leading-tight">
        <div className="font-brand text-[1.15rem] text-[#B8D4FF] tracking-[-0.02em] leading-none">Orbit</div>
        {showTagline ? (
          <div className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-slate-400 truncate">
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
      className={`block object-contain bg-transparent ${className || 'h-8 w-8'}`}
      draggable={false}
    />
  )
}
