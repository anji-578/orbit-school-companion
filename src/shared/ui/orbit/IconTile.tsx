import type { LucideIcon } from 'lucide-react'

export type Tone =
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'teal'
  | 'amber'
  | 'red'
  | 'math'
  | 'science'
  | 'chemistry'
  | 'english'

const GRADIENT: Record<Tone, string> = {
  blue: 'linear-gradient(145deg,#4A86FF,#2444D6)',
  green: 'linear-gradient(145deg,#25D68F,#0E9E66)',
  orange: 'linear-gradient(145deg,#FF9048,#F0561A)',
  pink: 'linear-gradient(145deg,#FF5C9F,#E02472)',
  purple: 'linear-gradient(145deg,#8A5CFF,#5A2FD6)',
  teal: 'linear-gradient(145deg,#1FC9C9,#0F8A9A)',
  amber: 'linear-gradient(145deg,#FFB02E,#E07B0B)',
  red: 'linear-gradient(145deg,#FF5C7A,#D12A4E)',
  math: 'linear-gradient(145deg,#4A86FF,#2444D6)',
  science: 'linear-gradient(145deg,#25D68F,#0E9E66)',
  chemistry: 'linear-gradient(145deg,#FF9048,#F0561A)',
  english: 'linear-gradient(145deg,#FF5C9F,#E02472)',
}

const SIZE = { sm: [30, 16, 9], md: [38, 20, 11], lg: [44, 22, 12], xl: [52, 28, 14] } as const

type Props = {
  icon?: LucideIcon
  glyph?: string
  tone: Tone
  size?: keyof typeof SIZE
  label?: string
}

/** Rounded gradient tile with a white glyph. Pass `glyph` for maths π. */
export function IconTile({ icon: Icon, glyph, tone, size = 'md', label }: Props) {
  const [box, icon, radius] = SIZE[size]
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="inline-grid shrink-0 place-items-center text-white"
      style={{
        width: box,
        height: box,
        borderRadius: radius + 2,
        background: GRADIENT[tone],
        boxShadow: '0 1px 0 rgba(255,255,255,.25) inset, 0 8px 18px rgba(0,0,0,.3)',
      }}
    >
      {Icon ? (
        <Icon size={icon} strokeWidth={1.75} />
      ) : (
        <span className="font-display font-extrabold" style={{ fontSize: icon + 4 }}>
          {glyph}
        </span>
      )}
    </span>
  )
}
