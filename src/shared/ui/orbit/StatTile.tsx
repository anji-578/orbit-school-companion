import type { LucideIcon } from 'lucide-react'
import { IconTile, type Tone } from './IconTile'

type Props = {
  icon: LucideIcon
  tone: Tone
  value: number | string
  label: string
  onClick?: () => void
}

export function StatTile({ icon, tone, value, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="o-card o-focus flex min-h-11 min-w-0 flex-1 flex-col gap-1.5 p-2.5 text-left active:scale-[0.98]"
    >
      <IconTile icon={icon} tone={tone} size="sm" />
      <span className="font-display text-[21px] font-extrabold tabular-nums leading-none text-o-text">
        {value}
      </span>
      <span className="text-[10.5px] leading-snug text-o-muted">{label}</span>
    </button>
  )
}
