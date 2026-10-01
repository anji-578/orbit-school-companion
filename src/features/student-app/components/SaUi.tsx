import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

export function SaCard({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`orbit-card w-full text-left ${onClick ? 'orbit-card-interactive' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}

export function SaSection({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow?: string
  title?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      {(eyebrow || title || action) && (
        <div className="flex items-end justify-between gap-2 px-0.5">
          <div className="min-w-0">
            {eyebrow ? <p className="orbit-eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="font-heading text-lg font-semibold text-white mt-0.5">{title}</h2> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function SaRow({
  icon: Icon,
  title,
  subtitle,
  meta,
  onClick,
  accent,
}: {
  icon?: LucideIcon
  title: string
  subtitle?: string
  meta?: string
  onClick?: () => void
  accent?: string
}) {
  return (
    <button type="button" onClick={onClick} className="orbit-card-interactive flex w-full items-center gap-3 text-left">
      {Icon ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-icon"
          style={{ background: accent ? `${accent}22` : 'rgb(30 123 255 / 0.14)' }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color: accent || '#1E7BFF' }} aria-hidden />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-white">{title}</span>
        {subtitle ? <span className="mt-0.5 block truncate text-[12px] text-orbit-text-secondary">{subtitle}</span> : null}
        {meta ? <span className="mt-0.5 block text-[11px] text-orbit-text-muted">{meta}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
    </button>
  )
}

export function SaChip({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
        active
          ? 'border-orbit-primary bg-orbit-primary text-white'
          : 'border-white/[0.08] bg-orbit-surface-raised text-orbit-text-secondary'
      }`}
    >
      {children}
    </button>
  )
}

export function SaPrimaryButton({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button type="button" onClick={onClick} className={`orbit-btn-primary ${className}`}>
      {children}
    </button>
  )
}

export function SaViewAll({ label = 'View all →', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="orbit-link">
      {label}
    </button>
  )
}
