import { useEffect, useId, useState } from 'react'

type Props = {
  value: number
  total: number
  size?: number
  stroke?: number
  label?: string
  showText?: boolean
}

export function ProgressRing({ value, total, size = 56, stroke = 5, label, showText = true }: Props) {
  const gid = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  const [p, setP] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setP(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])

  return (
    <span
      className="relative inline-block shrink-0 text-o-text"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={label ?? `${value} of ${total}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2BE39C" />
            <stop offset="1" stopColor="#1BA6FF" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--o-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      {showText ? (
        <span className="absolute inset-0 grid place-items-center font-display text-[13px] font-bold tabular-nums">
          {value}/{total}
        </span>
      ) : null}
    </span>
  )
}
