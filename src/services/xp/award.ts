import { getSupabase } from '@/services/supabase/client'
import { logger } from '@/services/logger'
import { demoFixturesEnabled } from '@/shared/config/env'
import { applyRuleAward, type XpEventType } from '@/domain/xp/rules'

export type GamificationSnapshot = {
  totalXp: number
  unlockedBadges: string[]
}

/** Fetch server XP projection for a student. */
export async function fetchXpProjection(studentId: string): Promise<GamificationSnapshot | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const [{ data: totalRow }, { data: badges }] = await Promise.all([
    supabase.from('student_xp_totals').select('total_xp').eq('student_id', studentId).maybeSingle(),
    supabase.from('student_badges').select('badge_name').eq('student_id', studentId),
  ])
  return {
    totalXp: Number(totalRow?.total_xp ?? 0),
    unlockedBadges: (badges ?? []).map((b) => String(b.badge_name)),
  }
}

/**
 * Record a learning event then call award_xp (no client points).
 */
export async function recordAndAwardXp(input: {
  studentId: string
  eventType: XpEventType
  refId?: string
}): Promise<GamificationSnapshot | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id
  if (!uid) {
    logger.warn('award_xp_no_user')
    return null
  }

  const { data: eventRow, error: insertErr } = await supabase
    .from('learning_events')
    .insert({
      student_id: input.studentId,
      event_type: input.eventType,
      ref_id: input.refId ?? null,
      created_by: uid,
    })
    .select('id')
    .single()

  if (insertErr || !eventRow?.id) {
    logger.warn('learning_event_insert_failed', {
      message: insertErr?.message,
      eventType: input.eventType,
    })
    return null
  }

  const { error: awardErr } = await supabase.rpc('award_xp', {
    p_learning_event_id: eventRow.id,
    p_idempotency_key: null,
  })
  if (awardErr) {
    logger.warn('award_xp_failed', { message: awardErr.message, eventType: input.eventType })
    return null
  }

  return fetchXpProjection(input.studentId)
}

export function demoLocalAward(prev: GamificationSnapshot, eventType: XpEventType): GamificationSnapshot {
  if (!demoFixturesEnabled()) return prev
  return applyRuleAward(prev, eventType)
}
