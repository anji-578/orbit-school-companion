export type AttendanceStatusLike = { status: string }

/**
 * Trailing Present streak from the end of a chronologically ordered record list.
 * Characterization of HomeToday / MeHub behaviour.
 */
export function presentStreak(records: AttendanceStatusLike[]): number {
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]?.status === 'Present') streak += 1
    else break
  }
  return streak
}
