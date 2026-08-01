import type { ComponentType } from 'react'
import { useOrbitStore } from '../store/orbitStore'
import type { Role } from '../types'

import { AlertsPanel } from './shared/AlertsPanel'
import { ScannerPanel } from './shared/ScannerPanel'
import { ExtracurricularPanel } from './shared/ExtracurricularPanel'
import { CalendarView } from './shared/CalendarView'

import { StudentDashboard } from './student/StudentDashboard'
import { StudyAssistant } from './student/StudyAssistant'
import { AcademicsPanel } from './student/AcademicsPanel'
import { AssignmentsPanel } from './student/AssignmentsPanel'
import { SchedulePanel } from './student/SchedulePanel'
import { AttendancePanel } from './student/AttendancePanel'
import { AchievementsPanel } from './student/AchievementsPanel'
import { SyllabusExplorer } from './student/SyllabusExplorer'

import { ParentDashboard } from './parent/ParentDashboard'
import { TeachersPanel } from './parent/TeachersPanel'
import { PaymentsPanel } from './parent/PaymentsPanel'
import { TransportPanel } from './parent/TransportPanel'
import { ParentAttendance } from './parent/ParentAttendance'
import { ParentHomework } from './parent/ParentHomework'

import { TeacherDashboard } from './teacher/TeacherDashboard'
import { TeacherAttendance } from './teacher/TeacherAttendance'
import { TeacherMarks } from './teacher/TeacherMarks'
import { TeacherSyllabus } from './teacher/TeacherSyllabus'
import { TeacherLeaves } from './teacher/TeacherLeaves'
import { TeacherJobs } from './teacher/TeacherJobs'
import { TeacherHomework } from './teacher/TeacherHomework'

import { SchoolDashboard } from './school/SchoolDashboard'
import { SchoolFees } from './school/SchoolFees'
import { SchoolHiring } from './school/SchoolHiring'
import { SchoolCalendar } from './school/SchoolCalendar'
import { SchoolBroadcast } from './school/SchoolBroadcast'
import { SchoolFleet } from './school/SchoolFleet'
import { SchoolLeaves } from './school/SchoolLeaves'
import { SchoolTimetable } from './school/SchoolTimetable'
import { SchoolRoster } from './school/SchoolRoster'

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

export function MainContent() {
  const role = useOrbitStore((s) => s.role)
  const activeTab = useOrbitStore((s) => s.activeTab)

  const routes = ROLE_ROUTES[role]
  const ActiveComponent = routes[activeTab] ?? DASHBOARD_BY_ROLE[role]

  return (
    <div className="flex-1 min-w-0 space-y-6">
      <ActiveComponent />
    </div>
  )
}
