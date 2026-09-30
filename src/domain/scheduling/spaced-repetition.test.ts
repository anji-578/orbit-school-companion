import { describe, expect, it } from 'vitest'
import { scheduleNextReview } from './spaced-repetition'

describe('scheduleNextReview', () => {
  it('lengthens interval on correct', () => {
    const fixed = () => new Date('2026-09-30T06:00:00.000Z')
    const next = scheduleNextReview(2, true, fixed)
    expect(next.intervalDays).toBe(4)
    expect(next.dueAt.getTime()).toBe(fixed().getTime() + 4 * 86_400_000)
  })

  it('resets to 1 day on incorrect', () => {
    const fixed = () => new Date('2026-09-30T06:00:00.000Z')
    const next = scheduleNextReview(10, false, fixed)
    expect(next.intervalDays).toBe(1)
  })
})
