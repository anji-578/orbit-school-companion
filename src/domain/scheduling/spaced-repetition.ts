import type { Clock } from './school-time'
import { systemClock } from './school-time'
import { nextReviewIntervalDays } from '../mastery/update-mastery'

export type ReviewPoint = {
  dueAt: Date
  intervalDays: number
}

/** Advance review schedule after an attempt. Pure given an injected clock. */
export function scheduleNextReview(
  prevIntervalDays: number,
  correct: boolean,
  clock: Clock = systemClock,
): ReviewPoint {
  const intervalDays = nextReviewIntervalDays(prevIntervalDays, correct)
  const dueAt = new Date(clock().getTime() + intervalDays * 86_400_000)
  return { dueAt, intervalDays }
}
