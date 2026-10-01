import { formatChip } from './dates'

type Props = { date: Date; timeZone?: string; locale?: string }

/** Never render raw ISO dates — always go through this. */
export function DateChip({ date, timeZone, locale }: Props) {
  const { wk, dm } = formatChip(date, timeZone, locale)
  return (
    <span className="inline-block min-w-[54px] shrink-0 rounded-chip bg-o-track px-2.5 py-1.5 text-center">
      <b className="block text-xs font-bold text-o-text">{wk}</b>
      <span className="text-xs text-o-muted">{dm}</span>
    </span>
  )
}
