import bank from '../data/gkQuizBank.json'
import type { GkDifficulty, GkQuestion, GkQuizProgress } from '../types'

export const GK_ROUND_SIZE = 25
export const GK_PASS_RATIO = 0.7

export const GK_LEVEL_ORDER: GkDifficulty[] = ['easy', 'medium', 'hard']

const questions = bank.questions as GkQuestion[]

export function getGkBankMeta() {
  return {
    total: bank.total as number,
    counts: bank.counts as Record<GkDifficulty, number>,
    topic: bank.topic as string,
  }
}

export function emptyGkProgress(): GkQuizProgress {
  const blank = (): GkQuizProgress['easy'] => ({
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

export function isGkLevelUnlocked(level: GkDifficulty, progress: GkQuizProgress): boolean {
  if (level === 'easy') return true
  if (level === 'medium') return progress.easy.passed
  return progress.medium.passed
}

export function nextGkLevel(level: GkDifficulty): GkDifficulty | null {
  const idx = GK_LEVEL_ORDER.indexOf(level)
  return idx >= 0 && idx < GK_LEVEL_ORDER.length - 1 ? GK_LEVEL_ORDER[idx + 1] : null
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Pick a fresh round of questions for a difficulty level. */
export function pickGkRound(difficulty: GkDifficulty, seed = Date.now()): GkQuestion[] {
  const pool = questions.filter((q) => q.difficulty === difficulty)
  if (pool.length === 0) return []
  const shuffled = seededShuffle(pool, seed)
  return shuffled.slice(0, Math.min(GK_ROUND_SIZE, shuffled.length))
}

export function scoreGkRound(
  round: GkQuestion[],
  answers: Record<number, number>,
): { correct: number; total: number; passed: boolean; percent: number } {
  let correct = 0
  round.forEach((q, idx) => {
    if (answers[idx] === q.answerIndex) correct += 1
  })
  const total = round.length
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100)
  const passed = total > 0 && correct / total >= GK_PASS_RATIO
  return { correct, total, passed, percent }
}
