import { describe, expect, it } from 'vitest'
import { applyXpProjection, rejectClientXpIncrease } from './projection'
import { applyRuleAward, homeworkEventType, XP_RULES } from './rules'
import { useOrbitStore } from '../../store/orbitStore'

describe('XP server authority', () => {
  it('applyXpProjection replaces totals (no client accumulate API)', () => {
    const next = applyXpProjection(
      { totalXp: 10, unlockedBadges: [] },
      { totalXp: 50, unlockedBadges: ['A'] },
    )
    expect(next.totalXp).toBe(50)
  })

  it('rejectClientXpIncrease ignores additive deltas', () => {
    const prev = { totalXp: 40, unlockedBadges: [] as string[] }
    expect(rejectClientXpIncrease(prev, 100).totalXp).toBe(40)
  })

  it('orbitStore has no addXp / unlockBadge', () => {
    const state = useOrbitStore.getState() as unknown as Record<string, unknown>
    expect(state.addXp).toBeUndefined()
    expect(state.unlockBadge).toBeUndefined()
    expect(typeof state.setGamificationProjection).toBe('function')
  })

  it('rules match homework difficulty mapping', () => {
    expect(homeworkEventType('Hard')).toBe('homework_complete_hard')
    expect(XP_RULES.quiz_perfect.points).toBe(100)
    expect(XP_RULES.quiz_perfect.badge).toBe('Quiz Whiz')
  })

  it('applyRuleAward mirrors server rules table', () => {
    const next = applyRuleAward({ totalXp: 0, unlockedBadges: [] }, 'quiz_perfect')
    expect(next.totalXp).toBe(100)
    expect(next.unlockedBadges).toContain('Quiz Whiz')
  })
})
