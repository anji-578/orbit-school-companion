import { demoFixturesEnabled } from '@/shared/config/env'
import { useOrbitStore } from '../store/orbitStore'
import { computeStudyScore } from '../lib/studyScore'
import { attendancePercent, homeworkPercent } from '../store/orbitHelpers'
import { withSyllabusLearningLinks } from '../lib/syllabusLinks'
import { emptyGkProgress } from '../lib/gkQuiz'

/** Dynamically load demo fixtures outside production builds. */
export async function loadDemoFixturesIfEnabled(): Promise<void> {
  // Hard gate so production bundlers can DCE the fixture chunk.
  if (import.meta.env.PROD) return
  if (!demoFixturesEnabled()) return
  const demo = await import('@/dev/fixtures/demo')
  const gkProgress = {
    ...emptyGkProgress(),
    easy: { bestScore: 22, bestTotal: 25, attempts: 2, passed: true },
    medium: { bestScore: 18, bestTotal: 25, attempts: 1, passed: false },
    roundsCompleted: 3,
  }
  const tasks = demo.initialTasks
  const attendanceRecords = demo.initialAttendance
  useOrbitStore.setState({
    attendanceRecords,
    tasks,
    studentGrades: demo.initialGrades,
    roster: demo.initialRoster,
    fees: demo.initialFees,
    paymentHistory: demo.initialPaymentHistory,
    outstandingFees: 42500,
    broadcasts: demo.initialBroadcasts,
    calendarEvents: demo.initialCalendar,
    leaves: demo.initialLeaves,
    curriculum: withSyllabusLearningLinks(demo.initialCurriculum),
    candidates: demo.initialCandidates,
    fleet: demo.initialFleet,
    notifications: demo.initialNotifications,
    competitions: demo.initialCompetitions,
    competitionEnrollments: demo.initialCompetitionEnrollments,
    teachers: demo.schoolTeachers,
    studentProfile: demo.initialStudentProfile,
    teacherAcademicProfile: demo.initialTeacherAcademicProfile,
    timetableByDay: demo.timetableByDay as never,
    totalXp: 1280,
    unlockedBadges: ['Streak Keeper', 'Curious Mind', 'Quiz Whiz', 'GK Starter'],
    gkProgress,
    studyScore: computeStudyScore(attendancePercent(attendanceRecords), homeworkPercent(tasks)),
    classLinked: true,
    busPosition: 62,
    busReachedSchool: false,
    showingSampleData: true,
    usingCloudData: false,
  })
}
