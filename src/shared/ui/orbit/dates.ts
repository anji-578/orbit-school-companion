/** Asia/Kolkata date helpers for student UI. Never show raw ISO in components. */

const TZ = 'Asia/Kolkata'

export function formatChip(date: Date, timeZone = TZ, locale = 'en-IN') {
  const wk = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone }).format(date)
  const dm = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone }).format(date)
  return { wk, dm }
}

export function startOfTodayIst(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = Number(parts.find((p) => p.type === 'year')?.value)
  const m = Number(parts.find((p) => p.type === 'month')?.value)
  const d = Number(parts.find((p) => p.type === 'day')?.value)
  // Approximate IST midnight as UTC-5:30 offset for comparisons of calendar dates.
  return new Date(Date.UTC(y, m - 1, d, -5, -30))
}

export function parseFlexibleDate(raw: string | Date | null | undefined): Date | null {
  if (!raw) return null
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw
  const s = raw.trim()
  if (!s) return null
  // ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

export function isPastDate(raw: string | Date | null | undefined, now = new Date()): boolean {
  const d = parseFlexibleDate(raw)
  if (!d) return false
  return d.getTime() < startOfTodayIst(now).getTime()
}

export function formatDueLabel(raw: string): string {
  const d = parseFlexibleDate(raw)
  if (!d) return raw
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
  }).format(d)
}
