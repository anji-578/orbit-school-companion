import { Suspense, lazy, type ComponentType, type ReactNode } from 'react'
import type { StudentDestination } from './studentNav'
import { useStudentNav } from './StudentNavContext'
import { NestedChrome } from './components/NestedChrome'
import { HomeToday } from './screens/HomeToday'
import { LearnHub } from './screens/LearnHub'
import { GrowHub } from './screens/GrowHub'
import { MeHub } from './screens/MeHub'
import { SubjectHome } from './screens/SubjectHome'
import { UpcomingScreen } from './screens/UpcomingScreen'
import { SubjectHomework } from './screens/SubjectHomework'
import { SubjectTopics } from './screens/SubjectTopics'

/** Heavy / rarely first-paint panels — keep them out of the home chunk. */
const AssignmentsPanel = lazy(() =>
  import('../student/AssignmentsPanel').then((m) => ({ default: m.AssignmentsPanel })),
)
const SchedulePanel = lazy(() =>
  import('../student/SchedulePanel').then((m) => ({ default: m.SchedulePanel })),
)
const StudyAssistant = lazy(() =>
  import('../student/StudyAssistant').then((m) => ({ default: m.StudyAssistant })),
)
const ScannerPanel = lazy(() => import('../shared/ScannerPanel').then((m) => ({ default: m.ScannerPanel })))
const GkQuizPanel = lazy(() => import('../student/GkQuizPanel').then((m) => ({ default: m.GkQuizPanel })))
const AcademicsPanel = lazy(() =>
  import('../student/AcademicsPanel').then((m) => ({ default: m.AcademicsPanel })),
)
const CalendarView = lazy(() => import('../shared/CalendarView').then((m) => ({ default: m.CalendarView })))
const CompetitionsPanel = lazy(() =>
  import('../student/CompetitionsPanel').then((m) => ({ default: m.CompetitionsPanel })),
)
const ExtracurricularPanel = lazy(() =>
  import('../shared/ExtracurricularPanel').then((m) => ({ default: m.ExtracurricularPanel })),
)
const AcademicProfile = lazy(() =>
  import('../student/AcademicProfile').then((m) => ({ default: m.AcademicProfile })),
)
const AttendancePanel = lazy(() =>
  import('../student/AttendancePanel').then((m) => ({ default: m.AttendancePanel })),
)
const AchievementsPanel = lazy(() =>
  import('../student/AchievementsPanel').then((m) => ({ default: m.AchievementsPanel })),
)
const TeachersPanel = lazy(() =>
  import('../parent/TeachersPanel').then((m) => ({ default: m.TeachersPanel })),
)
const InterestsDetail = lazy(() =>
  import('./screens/InterestsDetail').then((m) => ({ default: m.InterestsDetail })),
)
const PortfolioDetail = lazy(() =>
  import('./screens/PortfolioDetail').then((m) => ({ default: m.PortfolioDetail })),
)
const StudentAnnouncements = lazy(() =>
  import('./screens/StudentAnnouncements').then((m) => ({ default: m.StudentAnnouncements })),
)
const SettingsScreen = lazy(() =>
  import('./screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
)
const SchoolRecordsScreen = lazy(() =>
  import('./screens/SchoolRecordsScreen').then((m) => ({ default: m.SchoolRecordsScreen })),
)

function ScreenFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-o-muted" aria-busy="true">
      Loading…
    </div>
  )
}

function LazyPanel({ children }: { children: ReactNode }) {
  return <Suspense fallback={<ScreenFallback />}>{children}</Suspense>
}

function nested(Panel: ComponentType, hint?: string) {
  return (
    <LazyPanel>
      <NestedChrome hint={hint}>
        <Panel />
      </NestedChrome>
    </LazyPanel>
  )
}

/** Renders hub or nested destination for the student app stack. */
export function StudentScreen({ dest }: { dest: StudentDestination }) {
  const { params } = useStudentNav()
  const hasSubject = Boolean(params.subject)

  switch (dest) {
    case 'home':
      return <HomeToday />
    case 'learn':
      return <LearnHub />
    case 'grow':
      return <GrowHub />
    case 'me':
      return <MeHub />
    case 'subject':
      return <SubjectHome />
    case 'upcoming':
      return <UpcomingScreen />
    case 'homework':
      return hasSubject || params.taskId != null ? (
        <SubjectHomework />
      ) : (
        nested(AssignmentsPanel, 'All subjects')
      )
    case 'schedule':
      return nested(SchedulePanel)
    case 'syllabus':
      return <SubjectTopics />
    case 'study-assistant':
      return nested(StudyAssistant, 'You can also open Ask Orbit as a sheet from Home or Subject.')
    case 'scanner':
      return nested(ScannerPanel, params.subject ? `Scan for ${params.subject}` : undefined)
    case 'gk-quiz':
      return nested(GkQuizPanel)
    case 'academics':
    case 'assessments':
      return nested(AcademicsPanel, params.subject ? `Progress context: ${params.subject}` : undefined)
    case 'calendar':
      return nested(CalendarView)
    case 'competitions':
      return nested(CompetitionsPanel)
    case 'extracurriculars':
      return nested(ExtracurricularPanel)
    case 'interests':
      return (
        <LazyPanel>
          <InterestsDetail />
        </LazyPanel>
      )
    case 'profile':
      return nested(AcademicProfile, 'Learning profile')
    case 'attendance':
      return nested(AttendancePanel)
    case 'achievements':
      return nested(AchievementsPanel)
    case 'teachers':
      return nested(TeachersPanel)
    case 'alerts':
      return (
        <LazyPanel>
          <StudentAnnouncements />
        </LazyPanel>
      )
    case 'portfolio':
      return (
        <LazyPanel>
          <PortfolioDetail />
        </LazyPanel>
      )
    case 'school-records':
      return (
        <LazyPanel>
          <SchoolRecordsScreen />
        </LazyPanel>
      )
    case 'settings':
      return (
        <LazyPanel>
          <SettingsScreen />
        </LazyPanel>
      )
    default:
      return <HomeToday />
  }
}
