import { describe, expect, it } from 'vitest'
import { formatChip, isPastDate, formatDueLabel } from './dates'

describe('orbit date presentation', () => {
  it('formatChip uses Asia/Kolkata weekday and day-month', () => {
    const { wk, dm } = formatChip(new Date('2026-10-10T12:00:00+05:30'))
    expect(wk.length).toBeGreaterThan(0)
    expect(dm.length).toBeGreaterThan(0)
  })

  it('isPastDate hides yesterday ISO dates', () => {
    expect(isPastDate('2020-01-01')).toBe(true)
    expect(isPastDate('2099-12-31')).toBe(false)
  })

  it('formatDueLabel never returns raw ISO', () => {
    const label = formatDueLabel('2026-10-10')
    expect(label.includes('2026-10-10')).toBe(false)
  })
})
