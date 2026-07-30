import { getSupabase, isSupabaseConfigured } from './supabase'
import type { AttendanceRecord, AttendanceStatus, RosterStudent } from '../types'

/** Stable demo student IDs (seeded in Supabase for Sunrise). */
export const DEMO_STUDENT_IDS = {
  ananya: 'a1111111-1111-4111-8111-111111111101',
  sarah: 'a1111111-1111-4111-8111-111111111102',
  marcus: 'a1111111-1111-4111-8111-111111111103',
  pranitha: 'a1111111-1111-4111-8111-111111111104',
} as const

async function sunriseSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatAttendanceDay(isoDate: string): Omit<AttendanceRecord, 'status' | 'reason'> {
  const d = new Date(`${isoDate}T12:00:00`)
  const day = d.toLocaleDateString('en-US', { weekday: 'short' })
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return { date, day }
}

/** Attach current demo login to Ananya student / parent_link + school. */
export async function claimDemoLinks(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return

  const schoolId = await sunriseSchoolId()
  if (schoolId) {
    await supabase.from('profiles').update({ school_id: schoolId }).eq('id', user.id).is('school_id', null)
  }

  const email = (user.email || '').toLowerCase()
  if (email === 'student@orbit.app') {
    await supabase
      .from('students')
      .update({ profile_id: user.id })
      .eq('id', DEMO_STUDENT_IDS.ananya)
  } else if (email === 'parent@orbit.app') {
    await supabase.from('parent_links').upsert(
      {
        parent_profile_id: user.id,
        student_id: DEMO_STUDENT_IDS.ananya,
        relationship: 'guardian',
      },
      { onConflict: 'parent_profile_id,student_id' },
    )
  }
}

export async function fetchRosterWithTodayAttendance(): Promise<RosterStudent[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return []

  const [{ data: students }, { data: marks }] = await Promise.all([
    supabase
      .from('students')
      .select('id, roll_no, display_name')
      .eq('school_id', schoolId)
      .order('roll_no', { ascending: true }),
    supabase
      .from('attendance')
      .select('student_id, status')
      .eq('school_id', schoolId)
      .eq('date', todayIso()),
  ])

  if (!students?.length) return []

  const presentById = new Map(
    (marks ?? []).map((m) => [m.student_id as string, (m.status as AttendanceStatus) === 'Present']),
  )

  return students.map((row) => {
    const id = row.id as string
    return {
      id,
      name: (row.display_name as string) || `Student ${row.roll_no ?? ''}`.trim(),
      present: presentById.has(id) ? Boolean(presentById.get(id)) : true,
      isDemo: id === DEMO_STUDENT_IDS.ananya,
    }
  })
}

export async function upsertAttendanceMark(
  studentId: string,
  present: boolean,
  reason?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
  const schoolId = await sunriseSchoolId()
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
  return { ok: true }
}

export async function fetchAttendanceHistory(limit = 20): Promise<AttendanceRecord[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let studentId: string | null = null
  if (user?.id) {
    const { data: mine } = await supabase
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()
    if (mine?.id) studentId = mine.id as string
    if (!studentId) {
      const { data: linked } = await supabase
        .from('parent_links')
        .select('student_id')
        .eq('parent_profile_id', user.id)
        .limit(1)
        .maybeSingle()
      if (linked?.student_id) studentId = linked.student_id as string
    }
  }
  if (!studentId) studentId = DEMO_STUDENT_IDS.ananya

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
