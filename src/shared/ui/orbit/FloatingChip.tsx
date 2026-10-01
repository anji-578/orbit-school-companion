import type { LucideIcon } from 'lucide-react'
import { IconTile, type Tone } from './IconTile'

type Props = { icon: LucideIcon; line1: string; line2: string; tone: Tone; rotate?: number }

export function FloatingChip({ icon, line1, line2, tone, rotate = 0 }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-chip border border-o-border bg-o-note-bg px-2 py-1.5 shadow-card backdrop-blur-md"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <IconTile icon={icon} tone={tone} size="sm" />
      <span className="leading-tight">
        <span className="block text-[10px] font-bold text-o-text">{line1}</span>
        <span className="block text-[9px] text-o-muted">{line2}</span>
      </span>
    </span>
  )
}
