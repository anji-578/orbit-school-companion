import type { ReactNode } from 'react'
import { School } from 'lucide-react'

/** Premium empty state for unlinked accounts / empty lists. */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 sm:px-8 text-center space-y-3">
      <div className="mx-auto h-11 w-11 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent2)] flex items-center justify-center">
        {icon ?? <School className="h-5 w-5" aria-hidden />}
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-[12px] text-slate-400 leading-relaxed">{description}</p>
      </div>
      {action ? <div className="pt-1 flex justify-center">{action}</div> : null}
    </div>
  )
}
