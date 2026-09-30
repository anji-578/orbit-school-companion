/** Asia/Kolkata school-day helpers. Store UTC elsewhere; convert at edges. */

export const SCHOOL_TZ = 'Asia/Kolkata'

export type Clock = () => Date

export function systemClock(): Date {
  return new Date()
}

/** Calendar Y-M-D in school TZ for a given instant. */
export function schoolDateKey(now: Date = systemClock()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function schoolWeekdayMonFirst(now: Date = systemClock()): number {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: SCHOOL_TZ, weekday: 'short' }).format(now)
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  return map[wd] ?? 0
}

export function isSchoolWeekend(now: Date = systemClock()): boolean {
  const d = schoolWeekdayMonFirst(now)
  return d >= 5
}
