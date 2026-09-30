import { getSupabase } from '@/services/supabase/client'
import { logger } from '@/services/logger'

/**
 * Server-authoritative XP award. No-ops when offline / unconfigured.
 * Client store XP remains an optimistic display cache until Query wiring lands.
 */
export async function awardXpViaLedger(input: {
  studentId: string
  eventType: string
  refId?: string
  points: number
  idempotencyKey: string
  badge?: string
}): Promise<boolean> {
  const supabase = getSupabase()
  if (!supabase) return false
  const { error } = await supabase.rpc('award_xp', {
    p_student_id: input.studentId,
    p_event_type: input.eventType,
    p_ref_id: input.refId ?? null,
    p_points: input.points,
    p_idempotency_key: input.idempotencyKey,
    p_badge: input.badge ?? null,
  })
  if (error) {
    logger.warn('award_xp_failed', { message: error.message, eventType: input.eventType })
    return false
  }
  return true
}
