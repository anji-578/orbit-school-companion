import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  light: string
  dark: string
  locked?: boolean
  size?: number
  label: string
}

export function AchievementBadge({ icon: Icon, light, dark, locked = false, size = 64, label }: Props) {
  const id = useId()
  return (
    <svg
      width={size}
      height={size * (100 / 96)}
      viewBox="0 0 96 100"
      role="img"
      aria-label={`${label}${locked ? ', locked' : ''}`}
      style={{ opacity: locked ? 0.45 : 1, filter: locked ? 'grayscale(1)' : undefined }}
    >
      <defs>
        <linearGradient id={`${id}o`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${id}h`} cx="35%" cy="20%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon
        points="48,8 83,28 83,72 48,92 13,72 13,28"
        fill={`url(#${id}o)`}
        stroke={light}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon
        points="48,15 77,32 77,68 48,85 19,68 19,32"
        fill="#0A1226"
        fillOpacity=".86"
        stroke={light}
        strokeOpacity=".5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="48,8 83,28 83,72 48,92 13,72 13,28" fill={`url(#${id}h)`} />
      <g transform="translate(30 32)">
        <Icon size={36} strokeWidth={1.75} color="#fff" />
      </g>
    </svg>
  )
}
