import type { AttendanceRecord, CalendarEvent, HomeworkTask, NotificationItem } from '../types'
import type { TimetableByDay } from '../lib/timetableApi'
import { useOrbitStore } from '../store/orbitStore'

export const HOME_FIXTURE_IDS = ['home-busy', 'home-clear', 'home-empty'] as const
export type HomeFixtureId = (typeof HOME_FIXTURE_IDS)[number]

/** Topic shown on the next-class card in later Home steps. */
export const HOME_BUSY_TOPIC = 'Linear Equations'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const

function emptyWeek(): TimetableByDay {
  return Object.fromEntries(DAYS.map((d) => [d, { theory: [], lab: [] }])) as TimetableByDay
}

function busyWeek(): TimetableByDay {
  const week = emptyWeek()
  const theory = [
    {
      id: 'home-fx-math',
      code: 'M1',
      name: 'Mathematics',
      start: '08:00',
      end: '08:50',
      room: 'Online Class',
      teacher: '',
      type: 'Theory' as const,
    },
    {
      id: 'home-fx-sci',
      code: 'S1',
      name: 'Science',
      start: '09:00',
      end: '09:50',
      room: 'Lab 2',
      teacher: 'Mrs. Sharma',
      type: 'Theory' as const,
    },
    {
      id: 'home-fx-eng',
      code: 'E1',
      name: 'English',
      start: '11:00',
      end: '11:50',
      room: 'Room 12',
      teacher: '',
      type: 'Theory' as const,
    },
  ]
  for (const d of DAYS) week[d] = { theory, lab: [] }
  return week
}

const BUSY_TASKS: HomeworkTask[] = [
  {
    id: 9101,
    subject: 'Science',
    task: 'Science worksheet',
    due: 'Tomorrow',
    xp: 80,
    completed: false,
    difficulty: 'Medium',
    estimatedMinutes: 25,
    started: true,
  },
  {
    id: 9102,
    subject: 'Mathematics',
    task: 'Complete textbook exercise',
    due: 'Due in 2 days',
    xp: 50,
    completed: false,
    difficulty: 'Easy',
    estimatedMinutes: 15,
    started: false,
  },
]

const BUSY_ATTENDANCE: AttendanceRecord[] = [
  { date: 'Mon', day: 'Mon', status: 'Present' },
  { date: 'Tue', day: 'Tue', status: 'Present' },
  { date: 'Wed', day: 'Wed', status: 'Present' },
  { date: 'Thu', day: 'Thu', status: 'Present' },
]

const BUSY_CALENDAR: CalendarEvent[] = [
  { id: 9101, title: 'Unit test', category: 'Exams', date: 'Next week' },
]

const BUSY_ALERTS: NotificationItem[] = [
  {
    id: 9101,
    role: 'student',
    title: 'Homework due',
    body: 'Science worksheet due tomorrow.',
    unread: true,
    time: '1h ago',
  },
]

export function isHomeFixtureId(value: string | null): value is HomeFixtureId {
  return value === 'home-busy' || value === 'home-clear' || value === 'home-empty'
}

export function homeFixtureState(id: HomeFixtureId) {
  if (id === 'home-busy') {
    return {
      classLinked: true,
      linkedStudent: {
        id: '00000000-0000-4000-8000-00000000f001',
        displayName: 'Aarav',
        className: 'Grade 8-A',
        section: 'A',
      },
      timetableByDay: busyWeek(),
      tasks: BUSY_TASKS,
      attendanceRecords: BUSY_ATTENDANCE,
      calendarEvents: BUSY_CALENDAR,
      notifications: BUSY_ALERTS,
      showingSampleData: true,
    }
  }

  return {
    classLinked: true,
    linkedStudent: {
      id: '00000000-0000-4000-8000-00000000f001',
      displayName: 'Aarav',
      className: 'Grade 8-A',
      section: 'A',
    },
    timetableByDay: emptyWeek(),
    tasks: [] as HomeworkTask[],
    attendanceRecords: [] as AttendanceRecord[],
    calendarEvents: [] as CalendarEvent[],
    notifications: [] as NotificationItem[],
    showingSampleData: false,
  }
}

/** Writes Home fixture rows into the existing store. Does not change store shape. */
export function applyHomeFixture(id: HomeFixtureId): void {
  useOrbitStore.setState(homeFixtureState(id))
}
