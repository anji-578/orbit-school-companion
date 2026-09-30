import { demoFixturesEnabled } from '@/shared/config/env'
import { useOrbitStore } from '../store/orbitStore'

/** Dynamically load demo fixtures outside production builds. */
export async function loadDemoFixturesIfEnabled(): Promise<void> {
  // Hard gate so production bundlers can DCE the fixture chunk.
  if (import.meta.env.PROD) return
  if (!demoFixturesEnabled()) return
  const demo = await import('@/dev/fixtures/demo')
  useOrbitStore.setState({
    attendanceRecords: demo.initialAttendance,
    tasks: demo.initialTasks,
    studentGrades: demo.initialGrades,
    roster: demo.initialRoster,
    fees: demo.initialFees,
    paymentHistory: demo.initialPaymentHistory,
    broadcasts: demo.initialBroadcasts,
    calendarEvents: demo.initialCalendar,
    leaves: demo.initialLeaves,
    curriculum: demo.initialCurriculum,
    candidates: demo.initialCandidates,
    fleet: demo.initialFleet,
    notifications: demo.initialNotifications,
    competitions: demo.initialCompetitions,
    competitionEnrollments: demo.initialCompetitionEnrollments,
    teachers: demo.schoolTeachers,
    studentProfile: demo.initialStudentProfile,
    timetableByDay: demo.timetableByDay as never,
    showingSampleData: true,
  })
}
