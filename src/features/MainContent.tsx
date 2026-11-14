import { Suspense, lazy, type ComponentType } from 'react'
import { useOrbitStore } from '../store/orbitStore'
import type { Role } from '../types'

const AlertsPanel = lazy(() =>
  import('./shared/AlertsPanel').then((m) => ({ default: m.AlertsPanel })),
)
const ScannerPanel = lazy(() =>
  import('./shared/ScannerPanel').then((m) => ({ default: m.ScannerPanel })),
)
const ExtracurricularPanel = lazy(() =>
  import('./shared/ExtracurricularPanel').then((m) => ({ default: m.ExtracurricularPanel })),
)
const CalendarView = lazy(() =>
  import('./shared/CalendarView').then((m) => ({ default: m.CalendarView })),
)

const StudentDashboard = lazy(() =>
  import('./student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })),
)
const StudyAssistant = lazy(() =>
  import('./student/StudyAssistant').then((m) => ({ default: m.StudyAssistant })),
)
const AcademicsPanel = lazy(() =>
  import('./student/AcademicsPanel').then((m) => ({ default: m.AcademicsPanel })),
)
const AssignmentsPanel = lazy(() =>
  import('./student/AssignmentsPanel').then((m) => ({ default: m.AssignmentsPanel })),
)
const SchedulePanel = lazy(() =>
  import('./student/SchedulePanel').then((m) => ({ default: m.SchedulePanel })),
)
const AttendancePanel = lazy(() =>
  import('./student/AttendancePanel').then((m) => ({ default: m.AttendancePanel })),
)
const AchievementsPanel = lazy(() =>
  import('./student/AchievementsPanel').then((m) => ({ default: m.AchievementsPanel })),
)
const SyllabusExplorer = lazy(() =>
  import('./student/SyllabusExplorer').then((m) => ({ default: m.SyllabusExplorer })),
)
const AcademicProfile = lazy(() =>
  import('./student/AcademicProfile').then((m) => ({ default: m.AcademicProfile })),
)
const CompetitionsPanel = lazy(() =>
  import('./student/CompetitionsPanel').then((m) => ({ default: m.CompetitionsPanel })),
)
const GkQuizPanel = lazy(() =>
  import('./student/GkQuizPanel').then((m) => ({ default: m.GkQuizPanel })),
)

const ParentDashboard = lazy(() =>
  import('./parent/ParentDashboard').then((m) => ({ default: m.ParentDashboard })),
)
const TeachersPanel = lazy(() =>
  import('./parent/TeachersPanel').then((m) => ({ default: m.TeachersPanel })),
)
const PaymentsPanel = lazy(() =>
  import('./parent/PaymentsPanel').then((m) => ({ default: m.PaymentsPanel })),
)
const TransportPanel = lazy(() =>
  import('./parent/TransportPanel').then((m) => ({ default: m.TransportPanel })),
)
const ParentAttendance = lazy(() =>
  import('./parent/ParentAttendance').then((m) => ({ default: m.ParentAttendance })),
)
const ParentHomework = lazy(() =>
  import('./parent/ParentHomework').then((m) => ({ default: m.ParentHomework })),
)

const TeacherDashboard = lazy(() =>
  import('./teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })),
)
const TeacherAttendance = lazy(() =>
  import('./teacher/TeacherAttendance').then((m) => ({ default: m.TeacherAttendance })),
)
const TeacherMarks = lazy(() =>
  import('./teacher/TeacherMarks').then((m) => ({ default: m.TeacherMarks })),
)
const TeacherSyllabus = lazy(() =>
  import('./teacher/TeacherSyllabus').then((m) => ({ default: m.TeacherSyllabus })),
)
const TeacherLeaves = lazy(() =>
  import('./teacher/TeacherLeaves').then((m) => ({ default: m.TeacherLeaves })),
)
const TeacherJobs = lazy(() =>
  import('./teacher/TeacherJobs').then((m) => ({ default: m.TeacherJobs })),
)
const TeacherHomework = lazy(() =>
  import('./teacher/TeacherHomework').then((m) => ({ default: m.TeacherHomework })),
)
const TeacherParentMessage = lazy(() =>
  import('./teacher/TeacherParentMessage').then((m) => ({ default: m.TeacherParentMessage })),
)
const TeacherProfilePanel = lazy(() =>
  import('./teacher/TeacherProfilePanel').then((m) => ({ default: m.TeacherProfilePanel })),
)

const SchoolDashboard = lazy(() =>
  import('./school/SchoolDashboard').then((m) => ({ default: m.SchoolDashboard })),
)
const SchoolFees = lazy(() =>
  import('./school/SchoolFees').then((m) => ({ default: m.SchoolFees })),
)
const SchoolHiring = lazy(() =>
  import('./school/SchoolHiring').then((m) => ({ default: m.SchoolHiring })),
)
const SchoolCalendar = lazy(() =>
  import('./school/SchoolCalendar').then((m) => ({ default: m.SchoolCalendar })),
)
const SchoolBroadcast = lazy(() =>
  import('./school/SchoolBroadcast').then((m) => ({ default: m.SchoolBroadcast })),
)
const SchoolFleet = lazy(() =>
  import('./school/SchoolFleet').then((m) => ({ default: m.SchoolFleet })),
)
const SchoolLeaves = lazy(() =>
  import('./school/SchoolLeaves').then((m) => ({ default: m.SchoolLeaves })),
)
const SchoolTimetable = lazy(() =>
  import('./school/SchoolTimetable').then((m) => ({ default: m.SchoolTimetable })),
)
const SchoolRoster = lazy(() =>
  import('./school/SchoolRoster').then((m) => ({ default: m.SchoolRoster })),
)

const ROLE_ROUTES: Record<Role, Record<string, ComponentType>> = {
  student: {
    dashboard: StudentDashboard,
    'study-assistant': StudyAssistant,
    scanner: ScannerPanel,
    alerts: AlertsPanel,
    'syllabus-explorer': SyllabusExplorer,
    academics: AcademicsPanel,
    assignments: AssignmentsPanel,
    schedule: SchedulePanel,
    attendance: AttendancePanel,
    calendar: CalendarView,
    achievements: AchievementsPanel,
    extracurriculars: ExtracurricularPanel,
    profile: AcademicProfile,
    competitions: CompetitionsPanel,
    'gk-quiz': GkQuizPanel,
  },
  parent: {
    dashboard: ParentDashboard,
    scanner: ScannerPanel,
    alerts: AlertsPanel,
    academics: AcademicsPanel,
    homework: ParentHomework,
    attendance: ParentAttendance,
    calendar: CalendarView,
    teachers: TeachersPanel,
    payments: PaymentsPanel,
    transport: TransportPanel,
    extracurriculars: ExtracurricularPanel,
  },
  teacher: {
    dashboard: TeacherDashboard,
    scanner: ScannerPanel,
    alerts: AlertsPanel,
    'teacher-attendance': TeacherAttendance,
    'teacher-marks': TeacherMarks,
    'teacher-homework': TeacherHomework,
    'teacher-syllabus': TeacherSyllabus,
    'teacher-leaves': TeacherLeaves,
    'teacher-jobs': TeacherJobs,
    'teacher-messages': TeacherParentMessage,
    'teacher-profile': TeacherProfilePanel,
  },
  school: {
    dashboard: SchoolDashboard,
    alerts: AlertsPanel,
    'school-fees': SchoolFees,
    'school-roster': SchoolRoster,
    'school-timetable': SchoolTimetable,
    'school-leaves': SchoolLeaves,
    'school-hiring': SchoolHiring,
    'school-calendar': SchoolCalendar,
    'school-broadcast': SchoolBroadcast,
    'school-fleet': SchoolFleet,
  },
}

const DASHBOARD_BY_ROLE: Record<Role, ComponentType> = {
  student: StudentDashboard,
  parent: ParentDashboard,
  teacher: TeacherDashboard,
  school: SchoolDashboard,
}

function PanelFallback() {
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-slate-400" role="status">
      Loading…
    </div>
  )
}

export function MainContent() {
  const role = useOrbitStore((s) => s.role)
  const activeTab = useOrbitStore((s) => s.activeTab)

  const routes = ROLE_ROUTES[role]
  const ActiveComponent = routes[activeTab] ?? DASHBOARD_BY_ROLE[role]

  return (
    <div className="flex-1 min-w-0 space-y-6">
      <Suspense fallback={<PanelFallback />}>
        <ActiveComponent />
      </Suspense>
    </div>
  )
}
