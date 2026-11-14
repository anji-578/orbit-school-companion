import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'

export async function exportMyStudentData(): Promise<
  { ok: true; payload: unknown } | { ok: false; error: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Cloud export requires a school sign-in' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Not signed in' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return { ok: false, error: 'Not signed in' }

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()
  if (studentErr) return { ok: false, error: studentErr.message }
  if (!student?.id) return { ok: false, error: 'No student record linked to this account' }

  const { data, error } = await supabase.rpc('export_student_data', {
    p_student_id: student.id,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, payload: data }
}

export async function requestMyAccountDeletion(): Promise<
  { ok: true; requestId: string } | { ok: false; error: string }
> {
  const requestId = crypto.randomUUID()
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Deletion requests require a school sign-in' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Not signed in' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return { ok: false, error: 'Not signed in' }

  const schoolId = await resolveSchoolId()
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  const { error: rpcError } = await supabase.rpc('request_account_deletion', {
    p_request_id: requestId,
  })
  if (!rpcError) return { ok: true, requestId }

  // Fallback when migration not yet applied: audit_log path used by feedback.
  if (!schoolId) return { ok: false, error: rpcError.message }
  const { error } = await supabase.from('audit_log').insert({
    school_id: schoolId,
    actor_id: user.id,
    action: 'student_account_deletion_request',
    entity_type: 'student',
    entity_id: student?.id ?? requestId,
    payload: {
      requestId,
      studentId: student?.id ?? null,
      channel: 'in_app',
      policyVersion: '1.0',
    },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, requestId }
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
