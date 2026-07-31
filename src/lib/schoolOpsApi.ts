import { getSupabase, isSupabaseConfigured } from './supabase'
import type { BroadcastMessage, CalendarEvent, HomeworkTask, LeaveRequest, LeaveStatus } from '../types'

async function sunriseSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
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

export async function syncToggleHomework(id: number, completed: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from('homework_tasks').update({ completed, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function fetchHomeworkTasks(): Promise<HomeworkTask[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase
    .from('homework_tasks')
    .select('id, subject, task, due_label, xp, difficulty, completed')
    .order('created_at', { ascending: false })
    .limit(40)
  if (!data?.length) return []
  return data.map((row) => ({
    id: Number(row.id),
    subject: row.subject as string,
    task: row.task as string,
    due: (row.due_label as string) || '',
    xp: Number(row.xp) || 40,
    difficulty: (row.difficulty as HomeworkTask['difficulty']) || 'Medium',
    completed: Boolean(row.completed),
  }))
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

export async function loadSchoolOpsSnapshot(): Promise<{
  tasks?: HomeworkTask[]
  leaves?: LeaveRequest[]
  broadcasts?: BroadcastMessage[]
  calendarEvents?: CalendarEvent[]
}> {
  if (!isSupabaseConfigured()) return {}
  const [tasks, leaves, broadcasts, calendarEvents] = await Promise.all([
    fetchHomeworkTasks(),
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
