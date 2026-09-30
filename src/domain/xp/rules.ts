/** Mirrors public.xp_award_rules for offline/demo display only. */
export const XP_RULES = {
  homework_complete_easy: { points: 15, badge: null as string | null },
  homework_complete_medium: { points: 25, badge: null },
  homework_complete_hard: { points: 45, badge: null },
  homework_all_done: { points: 0, badge: 'Task Master' },
  quiz_perfect: { points: 100, badge: 'Quiz Whiz' },
  scan_practice_pass: { points: 100, badge: 'Concept Master' },
  scan_practice_scholar: { points: 0, badge: 'Rising Scholar' },
  gk_pass_easy: { points: 55, badge: 'GK Starter' },
  gk_pass_medium: { points: 70, badge: 'GK Explorer' },
  gk_pass_hard: { points: 80, badge: 'GK Champion' },
  gk_attempt: { points: 15, badge: null },
  ask_orbit_helpful: { points: 10, badge: 'Curious Mind' },
} as const

export type XpEventType = keyof typeof XP_RULES

export function homeworkEventType(difficulty?: string): XpEventType {
  if (difficulty === 'Hard') return 'homework_complete_hard'
  if (difficulty === 'Easy') return 'homework_complete_easy'
  return 'homework_complete_medium'
}

export type XpSnapshot = { totalXp: number; unlockedBadges: string[] }

/** Offline/demo mirror of server rules (never used when Supabase awards succeed). */
export function applyRuleAward(prev: XpSnapshot, eventType: XpEventType): XpSnapshot {
  const rule = XP_RULES[eventType]
  const badges = [...prev.unlockedBadges]
  if (rule.badge && !badges.includes(rule.badge)) badges.push(rule.badge)
  return { totalXp: prev.totalXp + rule.points, unlockedBadges: badges }
}
