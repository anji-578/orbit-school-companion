import type { StudentDestination, StudentTab } from '@/features/student-app/studentNav'
import { useEffect, useState } from 'react'
import { StudentApp } from '@/features/student-app/StudentApp'
import { useOrbitStore } from '../store/orbitStore'

function tabFor(dest: string): StudentTab {
  if (dest === 'grow' || dest === 'interests') return 'grow'
  if (
    dest === 'me' ||
    dest === 'settings' ||
    dest === 'school-records' ||
    dest === 'portfolio' ||
    dest === 'alerts'
  ) {
    return 'me'
  }
  if (dest === 'home') return 'home'
  return 'learn'
}

function rootDest(tab: StudentTab): StudentDestination {
  return tab
}

/** DEV-only student shell for visual / a11y tests. Does not change auth. */
export function StudentPreview() {
  const [ready, setReady] = useState(false)
  const setTheme = useOrbitStore((s) => s.setTheme)
  const setRole = useOrbitStore((s) => s.setRole)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const theme = q.get('theme') === 'light' ? 'light' : 'dark'
    const fixtures = q.get('fixtures') === '1'
    const homeFixture = q.get('fixture')
    const dest = (q.get('dest') || 'home') as StudentDestination
    const subject = q.get('subject') ?? undefined

    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    setTheme(theme)
    setRole('student')

    const tab = tabFor(dest)
    const root = { dest: rootDest(tab) }
    const stack =
      dest === root.dest
        ? [root]
        : [root, { dest, params: subject ? { subject } : undefined, title: subject }]
    localStorage.setItem(
      'orbit-student-nav-v1',
      JSON.stringify({
        savedAt: Date.now(),
        state: { tab, stack, askOrbitOpen: q.get('ask') === '1', askOrbitSeed: '', logoutConfirmOpen: false },
      }),
    )

    let cancelled = false
    void (async () => {
      if (homeFixture === 'home-busy' || homeFixture === 'home-clear' || homeFixture === 'home-empty') {
        const home = await import('@/dev/homeFixtures')
        home.applyHomeFixture(homeFixture)
      } else if (fixtures) {
        const demo = await import('@/dev/fixtures/demo')
        useOrbitStore.setState({
          attendanceRecords: demo.initialAttendance,
          tasks: demo.initialTasks,
          studentGrades: demo.initialGrades,
          calendarEvents: demo.initialCalendar,
          curriculum: demo.initialCurriculum,
          notifications: demo.initialNotifications,
          competitions: demo.initialCompetitions,
          competitionEnrollments: demo.initialCompetitionEnrollments,
          teachers: demo.schoolTeachers,
          studentProfile: demo.initialStudentProfile,
          timetableByDay: demo.timetableByDay as never,
          showingSampleData: true,
        })
      } else {
        useOrbitStore.setState({
          attendanceRecords: [],
          tasks: [],
          studentGrades: [],
          calendarEvents: [],
          curriculum: [],
          notifications: [],
          competitions: [],
          competitionEnrollments: [],
          teachers: [],
          showingSampleData: false,
        })
      }
      if (!cancelled) setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [setRole, setTheme])

  if (!ready) {
    return (
      <div
        className="orbit-root grid min-h-dvh place-items-center bg-o-bg text-o-muted"
        data-testid="student-preview-boot"
      >
        Loading preview…
      </div>
    )
  }

  return (
    <div data-testid="student-preview">
      <StudentApp />
    </div>
  )
}
