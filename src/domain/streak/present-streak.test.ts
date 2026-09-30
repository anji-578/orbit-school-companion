import { presentStreak } from './present-streak'

describe('presentStreak', () => {
  it('returns 0 for empty', () => {
    expect(presentStreak([])).toBe(0)
  })

  it('counts trailing Present only', () => {
    expect(
      presentStreak([
        { status: 'Present' },
        { status: 'Absent' },
        { status: 'Present' },
        { status: 'Present' },
      ]),
    ).toBe(2)
  })

  it('breaks on non-Present at end', () => {
    expect(presentStreak([{ status: 'Present' }, { status: 'Late' }])).toBe(0)
  })

  it('handles all Present', () => {
    expect(presentStreak([{ status: 'Present' }, { status: 'Present' }, { status: 'Present' }])).toBe(3)
  })
})
