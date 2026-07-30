import type { ComponentType } from 'react'
import { useOrbitStore } from '../store/orbitStore'
import type { Role } from '../types'

import { ScannerPanel } from './shared/ScannerPanel'
import { ExtracurricularPanel } from './shared/ExtracurricularPanel'

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

import { TeacherDashboard } from './teacher/TeacherDashboard'
import { TeacherAttendance } from './teacher/TeacherAttendance'
import { TeacherMarks } from './teacher/TeacherMarks'
import { TeacherSyllabus } from './teacher/TeacherSyllabus'
import { TeacherLeaves } from './teacher/TeacherLeaves'
import { TeacherJobs } from './teacher/TeacherJobs'

import { SchoolDashboard } from './school/SchoolDashboard'
import { SchoolFees } from './school/SchoolFees'
import { SchoolHiring } from './school/SchoolHiring'
import { SchoolCalendar } from './school/SchoolCalendar'
import { SchoolBroadcast } from './school/SchoolBroadcast'
import { SchoolFleet } from './school/SchoolFleet'

const ROLE_ROUTES: Record<Role, Record<string, ComponentType>> = {
  student: {
    dashboard: StudentDashboard,
    'study-assistant': StudyAssistant,
    scanner: ScannerPanel,
    'syllabus-explorer': SyllabusExplorer,
    academics: AcademicsPanel,
    assignments: AssignmentsPanel,
    schedule: SchedulePanel,
    attendance: AttendancePanel,
    achievements: AchievementsPanel,
    extracurriculars: ExtracurricularPanel,
  },
  parent: {
    dashboard: ParentDashboard,
    scanner: ScannerPanel,
    academics: AcademicsPanel,
    teachers: TeachersPanel,
    payments: PaymentsPanel,
    transport: TransportPanel,
    extracurriculars: ExtracurricularPanel,
  },
  teacher: {
    dashboard: TeacherDashboard,
    scanner: ScannerPanel,
    'teacher-attendance': TeacherAttendance,
    'teacher-marks': TeacherMarks,
    'teacher-syllabus': TeacherSyllabus,
    'teacher-leaves': TeacherLeaves,
    'teacher-jobs': TeacherJobs,
  },
  school: {
    dashboard: SchoolDashboard,
    'school-fees': SchoolFees,
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
    <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto orbit-scroll">
      <ActiveComponent />
    </main>
  )
}
