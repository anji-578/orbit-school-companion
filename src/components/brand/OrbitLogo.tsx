type OrbitLogoProps = {
  variant?: 'mark' | 'lockup' | 'hero'
  className?: string
  markClassName?: string
  showTagline?: boolean
}

/** Official Orbit brand mark + classy serif lockup for dark UI. */
export function OrbitLogo({
  variant = 'lockup',
  className = '',
  markClassName = '',
  showTagline = true,
}: OrbitLogoProps) {
  if (variant === 'mark') {
    return (
      <img
        src="/brand/orbit-mark.png"
        alt="Orbit"
        className={`object-contain ${markClassName || 'h-9 w-9'} ${className}`}
        draggable={false}
      />
    )
  }

  if (variant === 'hero') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative mb-5">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40"
            style={{
              background:
                'radial-gradient(circle, color-mix(in srgb, #5B8CFF 55%, transparent), transparent 70%)',
            }}
            aria-hidden
          />
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-[28px] bg-white/[0.04] border border-white/10 shadow-[0_20px_60px_-28px_rgba(59,130,246,0.55)] flex items-center justify-center p-3">
            <img
              src="/brand/orbit-mark.png"
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(11,31,68,0.35)]"
              draggable={false}
            />
          </div>
        </div>
        <h1 className="font-brand text-[2.75rem] sm:text-6xl leading-none tracking-[-0.02em] text-white">
          <span className="relative inline-block">
            O
            <span
              className="pointer-events-none absolute left-1/2 top-[42%] h-[1.15em] w-[1.15em] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5B8CFF]/90"
              style={{ transform: 'translate(-50%, -50%) rotate(-28deg) scaleY(0.42)' }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute right-[0.05em] top-[0.18em] h-2 w-2 rounded-full bg-[#5B8CFF] shadow-[0_0_10px_#5B8CFF]"
              aria-hidden
            />
          </span>
          rbit
        </h1>
        {showTagline ? (
          <p className="mt-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
            Your learning. <span className="text-[#5B8CFF]">Our orbit.</span>
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <div className="relative shrink-0">
        <div
          className="absolute -inset-1 rounded-2xl opacity-50 blur-md"
          style={{ background: 'radial-gradient(circle, rgba(91,140,255,0.45), transparent 70%)' }}
          aria-hidden
        />
        <div className="relative h-10 w-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center overflow-hidden p-1">
          <img src="/brand/orbit-mark.png" alt="" className={`h-full w-full object-contain ${markClassName}`} draggable={false} />
        </div>
      </div>
      <div className="min-w-0 leading-tight">
        <div className="font-brand text-[1.35rem] text-white tracking-[-0.02em] leading-none">Orbit</div>
        {showTagline ? (
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 truncate">
            Your learning. <span className="text-[#5B8CFF]">Our orbit.</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
