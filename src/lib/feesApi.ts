import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'
import type { FeeItem, FeeStatus } from '../types'
import { resolveLinkedStudentId } from './linkedStudent'


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

export async function fetchFeeItems(preferredStudentId?: string | null): Promise<FeeItem[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []

  const role = await currentRole()
  const scopedStudentId =
    role === 'parent' || role === 'student'
      ? preferredStudentId || (await resolveLinkedStudentId(preferredStudentId))
      : null

  // Parent/student with no link → empty (honest), not Ananya fallback.
  if ((role === 'parent' || role === 'student') && !scopedStudentId) return []

  let query = supabase
    .from('fee_items')
    .select('id, name, amount_paise, status, category, student_id, students(display_name)')
    .eq('school_id', schoolId)

  if (scopedStudentId) {
    query = query.eq('student_id', scopedStudentId)
  }

  const { data } = await query.order('created_at', { ascending: true })

  if (!data?.length) return []
  return data.map((row) => {
    const student = row.students as { display_name?: string } | { display_name?: string }[] | null
    const studentName = Array.isArray(student)
      ? student[0]?.display_name
      : student?.display_name
    return {
      id: row.id as string,
      name: row.name as string,
      amount: Math.round(Number(row.amount_paise) / 100),
      status: row.status as FeeStatus,
      category: (row.category as string) || 'General',
      studentId: (row.student_id as string) || undefined,
      studentName: studentName || undefined,
    }
  })
}

export async function markFeeItemsStatus(
  status: FeeStatus,
  studentId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const role = await currentRole()
  const target = studentId || (await resolveLinkedStudentId())
  if (!target) {
    // School verify without a student id must not wipe the whole class.
    if (role === 'school' || role === 'teacher') {
      return { ok: false, error: 'Student id required to update fee status' }
    }
    return { ok: false, error: 'No linked student for fee update' }
  }

  const { error } = await supabase
    .from('fee_items')
    .update({ status })
    .eq('school_id', schoolId)
    .eq('student_id', target)
    .neq('status', 'Paid')

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function createFeeItem(input: {
  studentId: string
  name: string
  amountRupees: number
  category?: string
  status?: FeeStatus
  dueDate?: string
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Connect Supabase to create fee invoices.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const name = input.name.trim()
  const amountPaise = Math.round(input.amountRupees * 100)
  if (!input.studentId || !name || amountPaise <= 0) {
    return { ok: false, error: 'Student, name, and amount are required.' }
  }

  const { data, error } = await supabase
    .from('fee_items')
    .insert({
      school_id: schoolId,
      student_id: input.studentId,
      name,
      amount_paise: amountPaise,
      status: input.status ?? 'Unpaid',
      category: input.category?.trim() || 'General',
      due_date: input.dueDate || null,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data.id as string }
}

export async function markAllFeesPaid(studentId?: string | null): Promise<{ ok: boolean; error?: string }> {
  return markFeeItemsStatus('Paid', studentId)
}

/** Group fee rows by student for the school class ledger. */
export function groupFeesByStudent(fees: FeeItem[]) {
  const map = new Map<
    string,
    { studentId: string; studentName: string; fees: FeeItem[]; outstanding: number; unpaidCount: number }
  >()

  for (const fee of fees) {
    const key = fee.studentId || 'unknown'
    const name = fee.studentName || 'Student'
    let entry = map.get(key)
    if (!entry) {
      entry = { studentId: key, studentName: name, fees: [], outstanding: 0, unpaidCount: 0 }
      map.set(key, entry)
    }
    entry.fees.push(fee)
    if (fee.status !== 'Paid') {
      entry.outstanding += fee.amount
      entry.unpaidCount += 1
    }
  }

  return [...map.values()].sort((a, b) => a.studentName.localeCompare(b.studentName))
}
