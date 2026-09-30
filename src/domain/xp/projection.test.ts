import { describe, expect, it } from 'vitest'
import { applyXpProjection, rejectClientXpIncrease } from './projection'
import { useOrbitStore } from '../../store/orbitStore'

describe('XP server authority', () => {
  it('applyXpProjection replaces totals (no client accumulate)', () => {
    const next = applyXpProjection(
      { totalXp: 10, unlockedBadges: [] },
      { totalXp: 50, unlockedBadges: ['A'] },
    )
    expect(next.totalXp).toBe(50)
    expect(next.unlockedBadges).toEqual(['A'])
  })

  it('rejectClientXpIncrease ignores additive deltas', () => {
    const prev = { totalXp: 40, unlockedBadges: [] as string[] }
    expect(rejectClientXpIncrease(prev, 100).totalXp).toBe(40)
    expect(rejectClientXpIncrease(prev, -5).totalXp).toBe(40)
  })

  it('orbitStore has no addXp mutator; projection setter replaces only', () => {
    const state = useOrbitStore.getState() as unknown as Record<string, unknown>
    expect(state.addXp).toBeUndefined()
    expect(typeof state.setGamificationProjection).toBe('function')

    useOrbitStore.getState().setGamificationProjection(12, ['X'])
    expect(useOrbitStore.getState().totalXp).toBe(12)
    useOrbitStore.getState().setGamificationProjection(12, ['X'])
    expect(useOrbitStore.getState().totalXp).toBe(12)
    useOrbitStore.getState().setGamificationProjection(0, [])
    expect(useOrbitStore.getState().totalXp).toBe(0)
  })
})
