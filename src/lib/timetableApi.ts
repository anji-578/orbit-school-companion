import { getSupabase, isSupabaseConfigured } from './supabase'
import { timetableByDay as demoTimetable } from '../data/demo'
import type { ClassSlot } from '../types'

export type TimetableSlot = {
  id: string
  code: string
  name: string
  start: string
  end: string
  room: string
  teacher: string
  type: 'Theory' | 'Lab'
}

export type TimetableDay = {
  theory: TimetableSlot[]
  lab: TimetableSlot[]
}

export type TimetableByDay = Record<string, TimetableDay>

export type TimelineItem = {
  id: string
  name: string
  time: string
  room: string
  status: ClassSlot['status']
}

const DAY_CODES = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const

function emptyWeek(): TimetableByDay {
  return Object.fromEntries(DAY_CODES.map((d) => [d, { theory: [], lab: [] }])) as TimetableByDay
}

function demoAsTimetable(): TimetableByDay {
  const week = emptyWeek()
  for (const day of DAY_CODES) {
    const src = demoTimetable[day]
    if (!src) continue
    week[day] = {
      theory: src.theory.map((s) => ({ ...s, type: 'Theory' as const })),
      lab: src.lab.map((s) => ({ ...s, type: 'Lab' as const })),
    }
  }
  return week
}

async function sunriseSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
}

/** Current weekday code (falls back to MON on weekends). */
export function currentDayCode(date = new Date()): (typeof DAY_CODES)[number] {
  const map = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const
  const code = map[date.getDay()]
  if (code === 'SUN' || code === 'SAT') return 'MON'
  return code
}

function minutesFromLabel(label: string): number {
  const [h, m] = label.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

function formatAmPm(start: string): string {
  const [hRaw, mRaw] = start.split(':').map(Number)
  const h = hRaw || 0
  const m = mRaw || 0
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}

export function slotStatus(start: string, end: string, now = new Date()): ClassSlot['status'] {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const startMin = minutesFromLabel(start)
  const endMin = minutesFromLabel(end)
  if (nowMin < startMin) return 'Upcoming'
  if (nowMin >= endMin) return 'Completed'
  return 'Live'
}

/** Flatten today's theory + lab into a live timeline. */
export function deriveTodayTimeline(day: TimetableDay | undefined, now = new Date()): TimelineItem[] {
  if (!day) return []
  const slots = [...day.theory, ...day.lab].sort(
    (a, b) => minutesFromLabel(a.start) - minutesFromLabel(b.start),
  )
  return slots.map((s) => ({
    id: s.id,
    name: s.name,
    time: formatAmPm(s.start),
    room: s.room,
    status: slotStatus(s.start, s.end, now),
  }))
}

export function getLocalTimetable(): TimetableByDay {
  return demoAsTimetable()
}

export async function fetchTimetableByDay(className = 'Grade 8-A'): Promise<TimetableByDay> {
  if (!isSupabaseConfigured()) return demoAsTimetable()
  const supabase = getSupabase()
  if (!supabase) return demoAsTimetable()
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return emptyWeek()

  const { data, error } = await supabase
    .from('class_timetable')
    .select('id, day_code, slot_type, code, name, start_time, end_time, room, teacher_name, sort_order')
    .eq('school_id', schoolId)
    .eq('class_name', className)
    .order('sort_order', { ascending: true })

  if (error || !data?.length) return emptyWeek()

  const week = emptyWeek()
  for (const row of data) {
    const day = row.day_code as string
    if (!week[day]) week[day] = { theory: [], lab: [] }
    const slot: TimetableSlot = {
      id: row.id as string,
      code: row.code as string,
      name: row.name as string,
      start: row.start_time as string,
      end: row.end_time as string,
      room: (row.room as string) || '',
      teacher: (row.teacher_name as string) || '',
      type: row.slot_type === 'Lab' ? 'Lab' : 'Theory',
    }
    if (slot.type === 'Lab') week[day].lab.push(slot)
    else week[day].theory.push(slot)
  }
  return week
}
