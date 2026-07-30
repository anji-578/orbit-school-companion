export function computeStudyScore(attendancePercent: number, homeworkCompletionPercent: number): number {
  const weighted = attendancePercent * 0.6 + homeworkCompletionPercent * 0.4
  return Math.min(100, Math.max(50, Math.round(weighted)))
}
