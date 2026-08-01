import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveLinkedStudentId } from './linkedStudent'
import type { BroadcastMessage, CalendarEvent, HomeworkTask, LeaveRequest, LeaveStatus } from '../types'

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

export async function syncAssignHomework(input: HomeworkTask & { userId?: string }): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null
  const schoolId = await sunriseSchoolId()
  const { data } = await supabase
    .from('homework_tasks')
    .insert({
      school_id: schoolId,
      subject: input.subject,
      task: input.task,
      due_label: input.due,
      xp: input.xp,
      difficulty: input.difficulty,
      completed: false,
      created_by: input.userId ?? null,
    })
    .select('id')
    .maybeSingle()
  return data?.id ? Number(data.id) : null
}

export async function syncToggleHomework(id: number, completed: boolean, studentId?: string | null): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return

  const linkedId = studentId ?? (await resolveLinkedStudentId())
  if (!linkedId) return

  await supabase.from('homework_completions').upsert(
    {
      homework_id: id,
      student_id: linkedId,
      completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'homework_id,student_id' },
  )
}

export async function fetchHomeworkTasks(linkedStudentId?: string | null): Promise<HomeworkTask[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []

  const role = await currentRole()
  let studentId = linkedStudentId ?? null
  if (!studentId && (role === 'student' || role === 'parent')) {
    studentId = await resolveLinkedStudentId()
  }

  const { data } = await supabase
    .from('homework_tasks')
    .select('id, subject, task, due_label, xp, difficulty, completed')
    .order('created_at', { ascending: false })
    .limit(40)

  if (!data?.length) return []

  let completionMap = new Map<number, boolean>()
  if (studentId) {
    const { data: completions } = await supabase
      .from('homework_completions')
      .select('homework_id, completed')
      .eq('student_id', studentId)
    if (completions?.length) {
      completionMap = new Map(completions.map((row) => [Number(row.homework_id), Boolean(row.completed)]))
    }
  }

  return data.map((row) => {
    const id = Number(row.id)
    const completed = studentId ? (completionMap.get(id) ?? false) : Boolean(row.completed)
    return {
      id,
      subject: row.subject as string,
      task: row.task as string,
      due: (row.due_label as string) || '',
      xp: Number(row.xp) || 40,
      difficulty: (row.difficulty as HomeworkTask['difficulty']) || 'Medium',
      completed,
    }
  })
}

export type HomeworkStudentProgress = {
  studentId: string
  name: string
  completed: boolean
}

export type HomeworkClassOverview = {
  homeworkId: number
  completedCount: number
  totalStudents: number
  students: HomeworkStudentProgress[]
}

/** Teacher/school view: who finished each assignment. */
export async function fetchHomeworkClassOverview(
  homeworkIds: number[],
): Promise<Record<number, HomeworkClassOverview>> {
  if (!isSupabaseConfigured() || homeworkIds.length === 0) return {}
  const supabase = getSupabase()
  if (!supabase) return {}
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return {}

  const [{ data: students }, { data: completions }] = await Promise.all([
    supabase
      .from('students')
      .select('id, display_name, roll_no')
      .eq('school_id', schoolId)
      .order('roll_no', { ascending: true }),
    supabase
      .from('homework_completions')
      .select('homework_id, student_id, completed')
      .in('homework_id', homeworkIds),
  ])

  if (!students?.length) return {}

  const done = new Set(
    (completions ?? [])
      .filter((row) => row.completed)
      .map((row) => `${Number(row.homework_id)}:${row.student_id as string}`),
  )

  const result: Record<number, HomeworkClassOverview> = {}
  for (const hwId of homeworkIds) {
    const list: HomeworkStudentProgress[] = students.map((s) => ({
      studentId: s.id as string,
      name: (s.display_name as string) || 'Student',
      completed: done.has(`${hwId}:${s.id as string}`),
    }))
    result[hwId] = {
      homeworkId: hwId,
      totalStudents: list.length,
      completedCount: list.filter((s) => s.completed).length,
      students: list,
    }
  }
  return result
}

export async function syncSubmitLeave(input: {
  date: string
  reason: string
  userId?: string
}): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null
  const schoolId = await sunriseSchoolId()
  const { data } = await supabase
    .from('leave_requests')
    .insert({
      school_id: schoolId,
      teacher_profile_id: input.userId ?? null,
      leave_date: input.date,
      reason: input.reason,
      status: 'Reviewing',
    })
    .select('id')
    .maybeSingle()
  return data?.id ? Number(data.id) : null
}

export async function syncSetLeaveStatus(id: number, status: LeaveStatus): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from('leave_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase
    .from('leave_requests')
    .select('id, leave_date, reason, status')
    .order('created_at', { ascending: false })
    .limit(40)
  if (!data?.length) return []
  return data.map((row) => ({
    id: Number(row.id),
    date: row.leave_date as string,
    reason: row.reason as string,
    status: row.status as LeaveStatus,
  }))
}

export async function syncBroadcast(input: BroadcastMessage & { userId?: string }): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  const schoolId = await sunriseSchoolId()
  await supabase.from('broadcasts').insert({
    school_id: schoolId,
    target: input.target,
    title: input.title,
    content: input.content,
    created_by: input.userId ?? null,
  })
}

export async function fetchBroadcasts(): Promise<BroadcastMessage[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase
    .from('broadcasts')
    .select('id, target, title, content, created_at')
    .order('created_at', { ascending: false })
    .limit(30)
  if (!data?.length) return []
  return data.map((row) => ({
    id: Number(row.id),
    target: row.target as string,
    title: row.title as string,
    content: row.content as string,
    date: new Date(row.created_at as string).toLocaleString(),
  }))
}

export async function syncCalendarEvent(input: CalendarEvent & { userId?: string }): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  const schoolId = await sunriseSchoolId()
  await supabase.from('calendar_events').insert({
    school_id: schoolId,
    title: input.title,
    category: input.category,
    event_date: input.date,
    created_by: input.userId ?? null,
  })
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase
    .from('calendar_events')
    .select('id, title, category, event_date')
    .order('created_at', { ascending: false })
    .limit(40)
  if (!data?.length) return []
  return data.map((row) => ({
    id: Number(row.id),
    title: row.title as string,
    category: row.category as CalendarEvent['category'],
    date: row.event_date as string,
  }))
}

export async function loadSchoolOpsSnapshot(linkedStudentId?: string | null): Promise<{
  tasks?: HomeworkTask[]
  leaves?: LeaveRequest[]
  broadcasts?: BroadcastMessage[]
  calendarEvents?: CalendarEvent[]
}> {
  if (!isSupabaseConfigured()) return {}
  const [tasks, leaves, broadcasts, calendarEvents] = await Promise.all([
    fetchHomeworkTasks(linkedStudentId),
    fetchLeaveRequests(),
    fetchBroadcasts(),
    fetchCalendarEvents(),
  ])
  return {
    tasks,
    leaves,
    broadcasts,
    calendarEvents,
  }
}
