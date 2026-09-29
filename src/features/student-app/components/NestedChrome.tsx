import type { ReactNode } from 'react'

/** Phase 8 — wraps legacy Panel UIs so they feel native inside the student stack. */
export function NestedChrome({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="student-embed student-nested space-y-3 pb-2">
      {hint ? <p className="text-[11px] text-[var(--muted)] px-0.5">{hint}</p> : null}
      {children}
    </div>
  )
}

export function SaEmpty({
  title,
  body,
  action,
}: {
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center space-y-2">
      <p className="text-sm font-bold text-[var(--fg)]">{title}</p>
      {body ? <p className="text-xs text-[var(--muted)] max-w-xs mx-auto leading-relaxed">{body}</p> : null}
      {action ? <div className="pt-2 flex justify-center">{action}</div> : null}
    </div>
  )
}
