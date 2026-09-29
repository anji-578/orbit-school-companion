import { AssignmentsPanel } from '../student/AssignmentsPanel'
import { SchedulePanel } from '../student/SchedulePanel'
import { StudyAssistant } from '../student/StudyAssistant'
import { ScannerPanel } from '../shared/ScannerPanel'
import { GkQuizPanel } from '../student/GkQuizPanel'
import { AcademicsPanel } from '../student/AcademicsPanel'
import { CalendarView } from '../shared/CalendarView'
import { CompetitionsPanel } from '../student/CompetitionsPanel'
import { ExtracurricularPanel } from '../shared/ExtracurricularPanel'
import { AcademicProfile } from '../student/AcademicProfile'
import { AttendancePanel } from '../student/AttendancePanel'
import { AchievementsPanel } from '../student/AchievementsPanel'
import { TeachersPanel } from '../parent/TeachersPanel'
import type { StudentDestination } from './studentNav'
import { useStudentNav } from './StudentNavContext'
import { NestedChrome } from './components/NestedChrome'
import { HomeToday } from './screens/HomeToday'
import { LearnHub } from './screens/LearnHub'
import { GrowHub } from './screens/GrowHub'
import { MeHub } from './screens/MeHub'
import { InterestsDetail } from './screens/InterestsDetail'
import { PortfolioDetail } from './screens/PortfolioDetail'
import { StudentAnnouncements } from './screens/StudentAnnouncements'
import { SettingsScreen } from './screens/SettingsScreen'
import { SchoolRecordsScreen } from './screens/SchoolRecordsScreen'
import { SubjectHome } from './screens/SubjectHome'
import { UpcomingScreen } from './screens/UpcomingScreen'
import { SubjectHomework } from './screens/SubjectHomework'
import { SubjectTopics } from './screens/SubjectTopics'

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
        <NestedChrome hint="All subjects">
          <AssignmentsPanel />
        </NestedChrome>
      )
    case 'schedule':
      return (
        <NestedChrome>
          <SchedulePanel />
        </NestedChrome>
      )
    case 'syllabus':
      return <SubjectTopics />
    case 'study-assistant':
      return (
        <NestedChrome hint="You can also open Ask Orbit as a sheet from Home or Subject.">
          <StudyAssistant />
        </NestedChrome>
      )
    case 'scanner':
      return (
        <NestedChrome hint={params.subject ? `Scan for ${params.subject}` : undefined}>
          <ScannerPanel />
        </NestedChrome>
      )
    case 'gk-quiz':
      return (
        <NestedChrome>
          <GkQuizPanel />
        </NestedChrome>
      )
    case 'academics':
    case 'assessments':
      return (
        <NestedChrome hint={params.subject ? `Progress context: ${params.subject}` : undefined}>
          <AcademicsPanel />
        </NestedChrome>
      )
    case 'calendar':
      return (
        <NestedChrome>
          <CalendarView />
        </NestedChrome>
      )
    case 'competitions':
      return (
        <NestedChrome>
          <CompetitionsPanel />
        </NestedChrome>
      )
    case 'extracurriculars':
      return (
        <NestedChrome>
          <ExtracurricularPanel />
        </NestedChrome>
      )
    case 'interests':
      return <InterestsDetail />
    case 'profile':
      return (
        <NestedChrome hint="Learning profile">
          <AcademicProfile />
        </NestedChrome>
      )
    case 'attendance':
      return (
        <NestedChrome>
          <AttendancePanel />
        </NestedChrome>
      )
    case 'achievements':
      return (
        <NestedChrome>
          <AchievementsPanel />
        </NestedChrome>
      )
    case 'teachers':
      return (
        <NestedChrome>
          <TeachersPanel />
        </NestedChrome>
      )
    case 'alerts':
      return <StudentAnnouncements />
    case 'portfolio':
      return <PortfolioDetail />
    case 'school-records':
      return <SchoolRecordsScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return <HomeToday />
  }
}
