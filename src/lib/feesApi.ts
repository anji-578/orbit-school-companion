import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'
import type { FeeItem, FeeStatus } from '../types'
import { resolveLinkedStudentId } from './linkedStudent'
import { writeAuditLog } from './auditApi'

export const FEE_PAGE_SIZE = 80


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

function mapFeeRow(row: Record<string, unknown>): FeeItem {
  type StudentJoin = {
    display_name?: string
    class_name?: string
    section?: string | null
    roll_no?: string | number | null
  }
  const student = row.students as StudentJoin | StudentJoin[] | null
  const s = Array.isArray(student) ? student[0] : student
  return {
    id: row.id as string,
    name: row.name as string,
    amount: Math.round(Number(row.amount_paise) / 100),
    status: row.status as FeeStatus,
    category: (row.category as string) || 'General',
    studentId: (row.student_id as string) || undefined,
    studentName: s?.display_name || undefined,
    className: s?.class_name || undefined,
    section: s?.section ?? null,
    rollNo: s?.roll_no != null ? String(s.roll_no) : undefined,
  }
}

export async function fetchFeeItems(
  preferredStudentId?: string | null,
  options?: { limit?: number; offset?: number },
): Promise<FeeItem[]> {
  const page = await fetchFeeItemsPage(preferredStudentId, options)
  return page.items
}

export async function fetchFeeItemsPage(
  preferredStudentId?: string | null,
  options?: { limit?: number; offset?: number },
): Promise<{ items: FeeItem[]; hasMore: boolean }> {
  if (!isSupabaseConfigured()) return { items: [], hasMore: false }
  const supabase = getSupabase()
  if (!supabase) return { items: [], hasMore: false }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { items: [], hasMore: false }

  const role = await currentRole()
  const scopedStudentId =
    role === 'parent' || role === 'student'
      ? preferredStudentId || (await resolveLinkedStudentId(preferredStudentId))
      : null

  // Parent/student with no link → empty (honest), not Ananya fallback.
  if ((role === 'parent' || role === 'student') && !scopedStudentId) {
    return { items: [], hasMore: false }
  }

  const limit = options?.limit ?? (scopedStudentId ? 40 : FEE_PAGE_SIZE)
  const offset = options?.offset ?? 0

  let query = supabase
    .from('fee_items')
    .select('id, name, amount_paise, status, category, student_id, students(display_name, class_name, section, roll_no)')
    .eq('school_id', schoolId)

  if (scopedStudentId) {
    query = query.eq('student_id', scopedStudentId)
  }

  const { data } = await query
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (!data?.length) return { items: [], hasMore: false }
  const items = data.map((row) => mapFeeRow(row as Record<string, unknown>))
  return { items, hasMore: items.length === limit }
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
  void writeAuditLog({
    action: 'fee.set_status',
    entityType: 'fee_items',
    entityId: target,
    payload: { status, studentId: target },
  })
  return { ok: true }
}

/** Create the same fee invoice for every active student matching classLabel (e.g. Grade 8-A). */
export async function createFeeItemsForClass(input: {
  classLabel: string
  name: string
  amountRupees: number
  category?: string
}): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Connect Supabase to create fee invoices.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const name = input.name.trim()
  const amountPaise = Math.round(input.amountRupees * 100)
  if (!input.classLabel.trim() || !name || amountPaise <= 0) {
    return { ok: false, error: 'Class, name, and amount are required.' }
  }

  const { data: students, error } = await supabase
    .from('students')
    .select('id, class_name, section')
    .eq('school_id', schoolId)
    .eq('active', true)
  if (error) return { ok: false, error: error.message }

  const target = input.classLabel.trim().toLowerCase()
  const ids = (students ?? [])
    .filter((s) => {
      const cls = (s.class_name as string) || ''
      const sec = (s.section as string | null) ?? null
      const label = sec ? `${cls}-${sec}` : cls
      return label.trim().toLowerCase() === target || cls.trim().toLowerCase() === target
    })
    .map((s) => s.id as string)

  if (!ids.length) return { ok: false, error: 'No active students in that class.' }

  const rows = ids.map((studentId) => ({
    school_id: schoolId,
    student_id: studentId,
    name,
    amount_paise: amountPaise,
    status: 'Unpaid' as const,
    category: input.category?.trim() || 'General',
  }))
  const { error: insertErr } = await supabase.from('fee_items').insert(rows)
  if (insertErr) return { ok: false, error: insertErr.message }
  return { ok: true, count: rows.length }
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

function feeStudentLabel(fee: FeeItem): string {
  const cls = fee.className?.trim() || ''
  const sec = fee.section?.trim()
  const classLabel = cls && sec ? `${cls}-${sec}` : cls
  const roll = fee.rollNo ? ` · Roll ${fee.rollNo}` : ''
  return classLabel ? `${classLabel}${roll}` : roll.replace(/^ · /, '')
}

/** Group fee rows by student for the school class ledger. */
export function groupFeesByStudent(fees: FeeItem[]) {
  const map = new Map<
    string,
    {
      studentId: string
      studentName: string
      studentMeta: string
      fees: FeeItem[]
      outstanding: number
      unpaidCount: number
    }
  >()

  for (const fee of fees) {
    const key = fee.studentId || 'unknown'
    const name = fee.studentName || 'Student'
    let entry = map.get(key)
    if (!entry) {
      entry = {
        studentId: key,
        studentName: name,
        studentMeta: feeStudentLabel(fee),
        fees: [],
        outstanding: 0,
        unpaidCount: 0,
      }
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
