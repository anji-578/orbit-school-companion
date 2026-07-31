import { useOrbitStore } from '../../store/orbitStore'

type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

const VER = 'v6'

/** Official Orbit brand — theme-aware transparent logos. */
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
      <img
        src={icon}
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
          className="relative block h-auto w-[128px] sm:w-[148px] object-contain bg-transparent transition-[filter] duration-500"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 min-w-0 bg-transparent ${className}`}>
      <img
        src={icon}
        alt=""
        className={`block h-8 w-8 shrink-0 object-contain bg-transparent ${markClassName}`}
        draggable={false}
      />
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
  const theme = useOrbitStore((s) => s.theme)
  const icon = theme === 'light' ? `/brand/orbit-icon-light.png?${VER}` : `/brand/orbit-icon-dark.png?${VER}`
  return (
    <img
      src={icon}
      alt={title}
      className={`block object-contain bg-transparent ${className || 'h-8 w-8'}`}
      draggable={false}
    />
  )
}
