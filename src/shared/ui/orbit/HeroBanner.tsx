import type { ReactNode } from 'react'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  artSrc: string
  artWidth?: number
  artHeight?: number
  chips?: ReactNode
  className?: string
}

/** Full-bleed hero: text left, art bleeding right with fade mask. */
export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  artSrc,
  artWidth = 220,
  artHeight = 160,
  chips,
  className = '',
}: Props) {
  return (
    <div className={`relative min-h-[140px] overflow-visible ${className}`}>
      <img
        src={artSrc}
        alt=""
        width={artWidth}
        height={artHeight}
        decoding="async"
        aria-hidden
        className="pointer-events-none absolute -right-7 top-0 h-[150px] w-auto max-w-[58%] object-contain"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 18%, #000 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 18%, #000 100%)',
        }}
      />
      <div className="relative z-[1] max-w-[190px] space-y-1.5 pr-2 pt-1">
        {eyebrow ? <p className="text-[14px] text-o-muted">{eyebrow}</p> : null}
        <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-tight text-o-text">
          {title}
        </h1>
        {subtitle ? <p className="text-[14px] leading-snug text-o-muted">{subtitle}</p> : null}
      </div>
      {chips}
    </div>
  )
}
