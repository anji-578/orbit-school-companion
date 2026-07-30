import type { CSSProperties, ReactNode } from 'react'

export function Card({
  children,
  className = '',
  onClick,
  style,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  style?: CSSProperties
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={style}
      className={`glass glass-hover rounded-2xl text-left ${onClick ? 'cursor-pointer w-full' : ''} ${className}`}
    >
      {children}
    </Comp>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`text-xs font-semibold uppercase tracking-widest text-slate-400 ${className}`}>
      {children}
    </div>
  )
}

export function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="glass rounded-2xl p-5 sm:p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-base font-extrabold text-white font-display">{title}</h2>
          {subtitle ? <p className="text-xs text-slate-400 mt-1">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StatTile({
  label,
  value,
  hint,
  onClick,
  accent,
}: {
  label: string
  value: string
  hint?: string
  onClick?: () => void
  accent?: string
}) {
  return (
    <Card onClick={onClick} className="p-5 min-h-[125px] flex flex-col justify-between">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</span>
      <div>
        <p className="text-2xl font-black text-white" style={accent ? { color: accent } : undefined}>
          {value}
        </p>
        {hint ? <p className="text-[10px] text-slate-400 mt-1">{hint}</p> : null}
      </div>
    </Card>
  )
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
