import type { Tone } from './IconTile'

const TONE_CLASS: Record<string, string> = {
  blue: 'bg-[rgba(30,123,255,0.16)] text-[#7eb6ff]',
  green: 'bg-[rgba(31,209,134,0.16)] text-[#5ee9b5]',
  purple: 'bg-[rgba(138,92,255,0.16)] text-[#c4b0ff]',
  amber: 'bg-[rgba(255,176,46,0.16)] text-[#ffc75c]',
  orange: 'bg-[rgba(255,144,72,0.16)] text-[#ffb080]',
  pink: 'bg-[rgba(255,92,159,0.16)] text-[#ff9cc4]',
  teal: 'bg-[rgba(31,201,201,0.16)] text-[#7eeaea]',
}

type Props = { label: string; tone?: Tone | keyof typeof TONE_CLASS }

export function TagChip({ label, tone = 'blue' }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${TONE_CLASS[tone] ?? TONE_CLASS.blue}`}
    >
      {label}
    </span>
  )
}
