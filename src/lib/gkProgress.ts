import type { GkDifficulty, GkQuizProgress } from '../types'
import { GK_ROUND_SIZE } from './gkConstants'

/** Empty GK progress — kept separate from the quiz bank JSON to avoid cold-start bloat. */
export function emptyGkProgress(): GkQuizProgress {
  const blank = (): GkQuizProgress[GkDifficulty] => ({
    bestScore: 0,
    bestTotal: GK_ROUND_SIZE,
    attempts: 0,
    passed: false,
  })
  return {
    easy: blank(),
    medium: blank(),
    hard: blank(),
    roundsCompleted: 0,
  }
}
