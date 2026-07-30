import { OrbitMark } from './OrbitMark'

type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

/** Official Orbit brand lockup — vector mark + serif wordmark for dark UI. */
export function OrbitLogo({
  variant = 'lockup',
  className = '',
  markClassName = '',
  showTagline = true,
}: OrbitLogoProps) {
  if (variant === 'mark') {
    return <OrbitMark className={`${markClassName || 'h-9 w-9'} ${className}`} />
  }

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative mb-5">
          <div
            className="absolute inset-[-18%] rounded-full blur-3xl opacity-45"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.45), transparent 68%)',
            }}
            aria-hidden
          />
          <OrbitMark className="relative h-28 w-28 sm:h-32 sm:w-32 drop-shadow-[0_12px_40px_rgba(59,130,246,0.35)]" />
        </div>
        <h1 className="font-brand text-[2.85rem] sm:text-6xl leading-none tracking-[-0.03em] text-white">
          <span className="relative inline-block pr-[0.12em]">
            O
            <span
              className="pointer-events-none absolute left-1/2 top-[44%] block h-[1.05em] w-[1.05em] rounded-full border border-[#60A5FA]"
              style={{ transform: 'translate(-50%, -50%) rotate(-28deg) scaleY(0.4)' }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute right-[0.02em] top-[0.2em] h-2 w-2 rounded-full bg-[#60A5FA] shadow-[0_0_12px_#60A5FA]"
              aria-hidden
            />
          </span>
          rbit
        </h1>
        {showTagline ? (
          <p className="mt-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Your learning. <span className="text-[#60A5FA]">Our orbit.</span>
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <OrbitMark className={`h-10 w-10 shrink-0 ${markClassName}`} />
      <div className="min-w-0 leading-tight">
        <div className="font-brand text-[1.4rem] text-white tracking-[-0.02em] leading-none">Orbit</div>
        {showTagline ? (
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 truncate">
            Your learning. <span className="text-[#60A5FA]">Our orbit.</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
