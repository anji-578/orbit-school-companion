import { clamp01, nextReviewIntervalDays, updateMastery } from './update-mastery'

describe('updateMastery', () => {
  it('correct raises estimate within bounds', () => {
    const next = updateMastery({ estimate: 0.4, uncertainty: 0.3 }, true)
    expect(next.estimate).toBeGreaterThan(0.4)
    expect(next.estimate).toBeLessThanOrEqual(1)
  })

  it('incorrect lowers estimate within bounds', () => {
    const next = updateMastery({ estimate: 0.6, uncertainty: 0.3 }, false)
    expect(next.estimate).toBeLessThan(0.6)
    expect(next.estimate).toBeGreaterThanOrEqual(0)
  })

  it('clamp01 handles NaN', () => {
    expect(clamp01(Number.NaN)).toBe(0)
  })
})

describe('nextReviewIntervalDays', () => {
  it('grows on success and resets on fail', () => {
    expect(nextReviewIntervalDays(2, true)).toBeGreaterThan(2)
    expect(nextReviewIntervalDays(10, false)).toBe(1)
  })
})
