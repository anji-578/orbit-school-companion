import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ICON } from '@/shared/ui/orbit'

/** Thin wrappers so existing call sites pick up Orbit kit recipes. */

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
      className={`o-card o-focus w-full p-4 text-left ${onClick ? 'active:scale-[0.98]' : ''} ${className}`}
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
  first,
}: {
  eyebrow?: string
  title?: string
  action?: ReactNode
  children: ReactNode
  first?: boolean
}) {
  return (
    <section className={`space-y-3 ${first ? '' : ''}`}>
      {(eyebrow || title || action) && (
        <div className={`flex items-center justify-between gap-2 ${first ? 'mt-0' : 'mt-1'}`}>
          <div className="min-w-0">
            {eyebrow ? <h2 className="o-label">{eyebrow}</h2> : null}
            {title ? <p className="mt-0.5 font-display text-lg font-semibold text-o-text">{title}</p> : null}
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
  const Chevron = ICON.chrome.chevron
  return (
    <button
      type="button"
      onClick={onClick}
      className="o-card o-focus flex w-full items-center gap-3 p-3.5 text-left active:scale-[0.98]"
    >
      {Icon ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tile"
          style={{
            background: accent ? `${accent}22` : 'color-mix(in srgb, var(--o-primary) 14%, transparent)',
          }}
        >
          <Icon
            className="h-5 w-5"
            strokeWidth={1.75}
            style={{ color: accent || 'var(--o-primary)' }}
            aria-hidden
          />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-o-text">{title}</span>
        {subtitle ? <span className="mt-0.5 block truncate text-[12px] text-o-muted">{subtitle}</span> : null}
        {meta ? <span className="mt-0.5 block text-[11px] text-o-faint">{meta}</span> : null}
      </span>
      <Chevron className="h-4 w-4 shrink-0 text-o-faint" strokeWidth={1.75} aria-hidden />
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
      className={`o-focus inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-semibold transition active:scale-[0.98] ${
        active
          ? 'border-o-primary bg-o-primary text-white'
          : 'border-o-border-strong bg-transparent text-o-muted'
      }`}
    >
      {active ? children : <>+ {children}</>}
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
    <button
      type="button"
      onClick={onClick}
      className={`o-btn-primary o-focus inline-flex items-center gap-2 ${className}`}
    >
      {children}
    </button>
  )
}

export function SaViewAll({ label = 'View all', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="o-focus -my-2 inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold text-o-primary"
    >
      {label}
      <span aria-hidden>→</span>
    </button>
  )
}
