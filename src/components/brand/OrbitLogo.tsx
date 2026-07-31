import { useOrbitStore } from '../../store/orbitStore'

type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

const VER = 'v11'

/** Official Orbit brand — theme-aware PNGs, equal visual weight in light/dark. */
export function OrbitLogo({
  variant = 'lockup',
  className = '',
  markClassName = '',
  showTagline = true,
}: OrbitLogoProps) {
  const theme = useOrbitStore((s) => s.theme)
  const logo = theme === 'light' ? `/brand/orbit-logo-light.png?${VER}` : `/brand/orbit-logo-dark.png?${VER}`
  const icon = theme === 'light' ? `/brand/orbit-icon-light.png?${VER}` : `/brand/orbit-icon-dark.png?${VER}`
  const wordColor = theme === 'light' ? 'text-[#0B1F44]' : 'text-[#F8FAFC]'
  const tagMuted = theme === 'light' ? 'text-slate-500' : 'text-slate-400'

  if (variant === 'mark') {
    return (
      <span className={`inline-flex items-center justify-center overflow-visible ${markClassName || 'h-10 w-10'} ${className}`}>
        <img
          src={icon}
          alt="Orbit"
          className="block h-full w-full object-contain bg-transparent"
          draggable={false}
        />
      </span>
    )
  }

  if (variant === 'hero') {
    return (
      <div className={`relative flex justify-center overflow-visible bg-transparent px-2 py-1 ${className}`}>
        <div
          className="pointer-events-none absolute inset-[-12%] rounded-full opacity-35 blur-3xl"
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
          className="relative block h-auto w-[148px] sm:w-[168px] object-contain bg-transparent"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-0 min-w-0 overflow-visible bg-transparent py-0.5 ${className}`}>
      <span className={`inline-flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-visible ${markClassName}`}>
        <img
          src={icon}
          alt=""
          className="block h-full w-full object-contain bg-transparent"
          draggable={false}
        />
      </span>
      <div className="min-w-0 leading-tight -ml-1">
        <div className={`font-brand text-[1.4rem] sm:text-[1.55rem] tracking-[-0.02em] leading-none ${wordColor}`}>
          Orbit
        </div>
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
  const theme = useOrbitStore((s) => s.theme)
  const icon = theme === 'light' ? `/brand/orbit-icon-light.png?${VER}` : `/brand/orbit-icon-dark.png?${VER}`
  return (
    <span className={`inline-flex items-center justify-center overflow-visible ${className || 'h-8 w-8'}`}>
      <img
        src={icon}
        alt={title}
        className="block h-full w-full object-contain bg-transparent"
        draggable={false}
      />
    </span>
  )
}
