import { AssignmentsPanel } from '../student/AssignmentsPanel'
import { SchedulePanel } from '../student/SchedulePanel'
import { SyllabusExplorer } from '../student/SyllabusExplorer'
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

/** Renders hub or nested destination for the student app stack. */
export function StudentScreen({ dest }: { dest: StudentDestination }) {
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
      return <AssignmentsPanel />
    case 'schedule':
      return <SchedulePanel />
    case 'syllabus':
      return <SyllabusExplorer />
    case 'study-assistant':
      return <StudyAssistant />
    case 'scanner':
      return <ScannerPanel />
    case 'gk-quiz':
      return <GkQuizPanel />
    case 'academics':
    case 'assessments':
      return <AcademicsPanel />
    case 'calendar':
      return <CalendarView />
    case 'competitions':
      return <CompetitionsPanel />
    case 'extracurriculars':
      return <ExtracurricularPanel />
    case 'interests':
      return <InterestsDetail />
    case 'profile':
      return <AcademicProfile />
    case 'attendance':
      return <AttendancePanel />
    case 'achievements':
      return <AchievementsPanel />
    case 'teachers':
      return <TeachersPanel />
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
