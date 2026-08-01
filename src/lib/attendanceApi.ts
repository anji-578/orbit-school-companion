import { getSupabase, isSupabaseConfigured } from './supabase'
import { classLabelsMatch, resolveClassLabel, resolveSchoolId } from './schoolPolicy'
import { resolveLinkedStudentId } from './linkedStudent'
import type { AttendanceRecord, AttendanceStatus, RosterStudent } from '../types'
import { writeAuditLog } from './auditApi'

export const ROSTER_PAGE_SIZE = 120

/** Stable demo student IDs (seeded in Supabase for Sunrise). */
export const DEMO_STUDENT_IDS = {
  ananya: 'a1111111-1111-4111-8111-111111111101',
  sarah: 'a1111111-1111-4111-8111-111111111102',
  marcus: 'a1111111-1111-4111-8111-111111111103',
  pranitha: 'a1111111-1111-4111-8111-111111111104',
} as const


function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatAttendanceDay(isoDate: string): Omit<AttendanceRecord, 'status' | 'reason'> {
  const d = new Date(`${isoDate}T12:00:00`)
  const day = d.toLocaleDateString('en-US', { weekday: 'short' })
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return { date, day }
}

/** Attach Sunrise demo logins via security-definer RPC (no client school_id / role writes). */
export async function claimDemoLinks(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return

  const email = user.email.toLowerCase()
  if (email.endsWith('@pilot100.orbit.app')) return
  if (!email.endsWith('@orbit.app')) return

  await supabase.rpc('claim_demo_links')
}

export async function fetchRosterWithTodayAttendance(options?: {
  /** When true (teacher default), limit to assigned classes / school_policy. School admin passes false. */
  activeClassOnly?: boolean
  /** School admin: include soft-deactivated students. Default false. */
  includeInactive?: boolean
  limit?: number
  offset?: number
}): Promise<RosterStudent[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let role: string | null = null
  if (user?.id) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    role = (profile?.role as string | undefined) ?? null
  }

  const activeClassOnly = options?.activeClassOnly ?? role === 'teacher'
  const includeInactive = options?.includeInactive ?? false
  const limit = options?.limit ?? ROSTER_PAGE_SIZE
  const offset = options?.offset ?? 0

  let studentsQuery = supabase
    .from('students')
    .select('id, roll_no, display_name, class_name, section, active')
    .eq('school_id', schoolId)
    .order('roll_no', { ascending: true })
    .range(offset, offset + limit - 1)
  if (!includeInactive) studentsQuery = studentsQuery.eq('active', true)

  const teacherClassesPromise =
    role === 'teacher' && user?.id
      ? supabase
          .from('teacher_classes')
          .select('class_name, section')
          .eq('teacher_profile_id', user.id)
      : Promise.resolve({ data: null as { class_name: string; section: string | null }[] | null })

  const teacherClassesResult = await teacherClassesPromise
  const teacherLabelsEarly = (teacherClassesResult.data ?? []).map((row) =>
    resolveClassLabel({
      linkedClassName: row.class_name as string,
      linkedSection: (row.section as string | null) ?? null,
    }),
  )

  // Prefer SQL class filter for teachers so the page isn't wasted on other grades.
  if (activeClassOnly && teacherLabelsEarly.length === 1) {
    const only = teacherClassesResult.data![0]!
    studentsQuery = studentsQuery.eq('class_name', only.class_name as string)
    if (only.section) studentsQuery = studentsQuery.eq('section', only.section as string)
  }

  const [{ data: students }, { data: marks }] = await Promise.all([
    studentsQuery,
    supabase
      .from('attendance')
      .select('student_id, status')
      .eq('school_id', schoolId)
      .eq('date', todayIso()),
  ])

  if (!students?.length) return []

  const teacherLabels = teacherLabelsEarly
  const activeClass = resolveClassLabel()
  const presentById = new Map(
    (marks ?? []).map((m) => [m.student_id as string, (m.status as AttendanceStatus) === 'Present']),
  )

  return students
    .map((row) => {
      const id = row.id as string
      const roll = row.roll_no != null ? String(row.roll_no) : undefined
      const className = (row.class_name as string) || ''
      const section = (row.section as string | null) ?? null
      const classLabel = resolveClassLabel({ linkedClassName: className, linkedSection: section })
      const marked = presentById.has(id)
      return {
        id,
        name: (row.display_name as string) || `Student ${roll ?? ''}`.trim(),
        present: marked ? Boolean(presentById.get(id)) : true,
        marked,
        rollNo: roll,
        className,
        section,
        classLabel,
        active: row.active !== false,
        isDemo: id === DEMO_STUDENT_IDS.ananya,
      } satisfies RosterStudent
    })
    .filter((row) => {
      if (!activeClassOnly) return true
      if (teacherLabels.length) {
        return teacherLabels.some((label) => classLabelsMatch(row.classLabel, label))
      }
      return classLabelsMatch(row.classLabel, activeClass)
    })
}

export async function setStudentActive(
  studentId: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const { error } = await supabase.from('students').update({ active }).eq('id', studentId)
  if (error) return { ok: false, error: error.message }
  void writeAuditLog({
    action: active ? 'student.reactivate' : 'student.deactivate',
    entityType: 'students',
    entityId: studentId,
    payload: { active },
  })
  return { ok: true }
}

export async function upsertAttendanceMark(
  studentId: string,
  present: boolean,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('attendance').upsert(
    {
      school_id: schoolId,
      student_id: studentId,
      date: todayIso(),
      status: present ? 'Present' : 'Absent',
      reason: present ? null : reason || 'Marked absent by class teacher',
      marked_by: user?.id ?? null,
    },
    { onConflict: 'student_id,date' },
  )

  if (error) return { ok: false, error: error.message }
  void writeAuditLog({
    action: 'attendance.mark',
    entityType: 'attendance',
    entityId: studentId,
    payload: { present, date: todayIso() },
  })
  return { ok: true }
}

export async function fetchAttendanceHistory(
  limit = 20,
  preferredStudentId?: string | null,
): Promise<AttendanceRecord[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []

  const studentId = preferredStudentId || (await resolveLinkedStudentId(preferredStudentId))
  if (!studentId) return []

  const { data } = await supabase
    .from('attendance')
    .select('date, status, reason')
    .eq('student_id', studentId)
    .order('date', { ascending: true })
    .limit(limit)

  if (!data?.length) return []
  return data.map((row) => ({
    ...formatAttendanceDay(row.date as string),
    status: row.status as AttendanceStatus,
    reason: (row.reason as string | null) || undefined,
  }))
}
