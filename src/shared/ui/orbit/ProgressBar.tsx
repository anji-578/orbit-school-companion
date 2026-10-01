import { useEffect, useState } from 'react'

type Props = { value: number; max?: number; height?: 4 | 6; accent?: string; label?: string }

export function ProgressBar({ value, max = 100, height = 4, accent = 'var(--o-primary)', label }: Props) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct))
    return () => cancelAnimationFrame(id)
  }, [pct])

  return (
    <div
      className="w-full overflow-hidden rounded-full bg-o-track"
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: accent,
          transition: 'width 900ms cubic-bezier(.22,1,.36,1)',
        }}
      />
    </div>
  )
}
