import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'

export type StudentFeedbackKind = 'feedback' | 'problem'

export async function submitStudentFeedback(input: {
  kind: StudentFeedbackKind
  category: string
  message: string
  rating?: number
  severity?: string
}): Promise<{ ok: true; requestId: string } | { ok: false; error: string }> {
  const requestId = crypto.randomUUID()
  if (!isSupabaseConfigured()) {
    return { ok: true, requestId }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Not signed in' }
  const schoolId = await resolveSchoolId()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!schoolId || !user?.id) return { ok: false, error: 'School profile required' }
  const { error } = await supabase.from('audit_log').insert({
    school_id: schoolId,
    actor_id: user.id,
    action: input.kind === 'problem' ? 'student_report_problem' : 'student_feedback',
    entity_type: 'student_app',
    entity_id: requestId,
    payload: {
      requestId,
      category: input.category,
      message: input.message.slice(0, 4000),
      rating: input.rating ?? null,
      severity: input.severity ?? null,
      app: 'student',
    },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, requestId }
}
