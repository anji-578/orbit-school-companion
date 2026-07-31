import { getSupabase, isSupabaseConfigured } from './supabase'
import type { FeeItem, FeeStatus } from '../types'
import { DEMO_STUDENT_IDS } from './attendanceApi'

async function sunriseSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
}

async function currentRole(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return null
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return (data?.role as string | undefined) ?? null
}

/** Linked child for parent/student; null when unlinked (no silent Ananya fallback). */
export async function resolveLinkedStudentId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return null

  const { data: mine } = await supabase.from('students').select('id').eq('profile_id', user.id).maybeSingle()
  if (mine?.id) return mine.id as string

  const { data: linked } = await supabase
    .from('parent_links')
    .select('student_id')
    .eq('parent_profile_id', user.id)
    .limit(1)
    .maybeSingle()
  if (linked?.student_id) return linked.student_id as string

  return null
}

export async function fetchFeeItems(): Promise<FeeItem[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return []

  const role = await currentRole()
  let studentId: string | null =
    role === 'parent' || role === 'student' ? await resolveLinkedStudentId() : DEMO_STUDENT_IDS.ananya

  // Pilot school auditor defaults to Ananya ledger when staff
  if ((role === 'school' || role === 'teacher') && !studentId) {
    studentId = DEMO_STUDENT_IDS.ananya
  }
  if (!studentId) return []

  const { data } = await supabase
    .from('fee_items')
    .select('id, name, amount_paise, status, category')
    .eq('school_id', schoolId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })

  if (!data?.length) return []
  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    amount: Math.round(Number(row.amount_paise) / 100),
    status: row.status as FeeStatus,
    category: (row.category as string) || 'General',
  }))
}

export async function markFeeItemsStatus(
  status: FeeStatus,
  studentId?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const role = await currentRole()
  // Parents cannot write fee_items under hardened RLS — school verifies UTR then marks Paid
  if (role !== 'school') {
    return { ok: true }
  }

  const target = studentId || (await resolveLinkedStudentId()) || DEMO_STUDENT_IDS.ananya
  const { error } = await supabase
    .from('fee_items')
    .update({ status })
    .eq('school_id', schoolId)
    .eq('student_id', target)
    .neq('status', 'Paid')

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function markAllFeesPaid(studentId?: string): Promise<{ ok: boolean; error?: string }> {
  return markFeeItemsStatus('Paid', studentId || DEMO_STUDENT_IDS.ananya)
}
