type Props = { className?: string }

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse rounded-tile bg-o-track ${className}`}
      aria-hidden
    />
  )
}
