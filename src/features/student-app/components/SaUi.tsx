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
      className={`student-card w-full text-left rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)] shadow-[0_8px_24px_rgba(11,31,68,0.06)] ${className}`}
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
    <section className="space-y-2.5">
      {(eyebrow || title || action) && (
        <div className="flex items-end justify-between gap-2 px-0.5">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="text-sm font-extrabold text-[var(--fg)] mt-0.5">{title}</h2> : null}
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
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/35 transition text-left"
    >
      {Icon ? (
        <span
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent ? `${accent}22` : 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
        >
          <Icon className="h-5 w-5" style={{ color: accent || 'var(--accent)' }} aria-hidden />
        </span>
      ) : null}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-[var(--fg)] truncate">{title}</span>
        {subtitle ? <span className="block text-[11px] text-[var(--muted)] mt-0.5 truncate">{subtitle}</span> : null}
        {meta ? <span className="block text-[10px] text-[var(--muted)] mt-0.5">{meta}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 text-[var(--muted)] shrink-0" aria-hidden />
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
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-bold border transition ${
        active
          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
          : 'bg-[var(--panel)] text-[var(--muted)] border-[var(--border)]'
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
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
    >
      {children}
    </button>
  )
}
