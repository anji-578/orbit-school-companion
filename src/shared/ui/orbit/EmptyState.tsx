import type { ReactNode } from 'react'

type Props = { art?: string; title: string; body: string; action?: ReactNode; compact?: boolean }

export function EmptyState({ art, title, body, action, compact }: Props) {
  return (
    <div
      className={`o-card flex flex-col items-center text-center ${compact ? 'gap-2 p-4' : 'gap-3 px-5 py-7'}`}
    >
      {art ? (
        <img
          src={art}
          alt=""
          width={compact ? 56 : 84}
          height={compact ? 56 : 84}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <p className="font-display text-[16px] font-bold text-o-text">{title}</p>
      <p className="max-w-[28ch] text-[13px] text-o-muted">{body}</p>
      {action}
    </div>
  )
}
