/**
 * BKT-lite / Elo-lite mastery update. Pure and deterministic.
 * estimate in [0,1]; uncertainty in (0,1].
 */
export type MasteryPoint = {
  estimate: number
  uncertainty: number
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** Correct answers raise estimate; incorrect lower it. Uncertainty shrinks slowly. */
export function updateMastery(prev: MasteryPoint, correct: boolean, learningRate = 0.15): MasteryPoint {
  const lr = Math.min(0.5, Math.max(0.01, learningRate))
  const delta = correct ? lr * (1 - prev.estimate) : -lr * prev.estimate
  const estimate = clamp01(prev.estimate + delta)
  const uncertainty = clamp01(prev.uncertainty * (1 - lr * 0.35) + 0.02)
  return { estimate, uncertainty: Math.max(0.05, uncertainty) }
}

/** Simple spaced-repetition interval (days). */
export function nextReviewIntervalDays(prevInterval: number, correct: boolean): number {
  const base = Math.max(1, prevInterval)
  if (correct) return Math.min(60, Math.round(base * 1.8))
  return 1
}
