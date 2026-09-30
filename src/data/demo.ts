/**
 * Production-safe empty seeds. Real sample data lives in `@/dev/fixtures/demo`
 * and is loaded only when demo fixtures are enabled (non-production builds).
 */
import type {
  AttendanceRecord,
  BroadcastMessage,
  CalendarEvent,
  Candidate,
  CompetitionEnrollment,
  FeeItem,
  FleetBus,
  HomeworkTask,
  LeaveRequest,
  NotificationItem,
  OrbitCompetition,
  PaymentRecord,
  RosterStudent,
  SoftSkill,
  StudentAcademicProfile,
  StudentGrade,
  SyllabusChapter,
  TeacherAcademicProfile,
  TeacherProfile,
} from '../types'

export const STUDENT_NAME = ''
export const CLASS_LABEL = ''
export const ALL_BADGES: { name: string; desc: string }[] = [
  { name: 'Streak Keeper', desc: 'Attendance streak' },
  { name: 'Early Bird', desc: 'Early login' },
  { name: 'Curious Mind', desc: 'Ask Orbit' },
  { name: 'Quiz Whiz', desc: 'Perfect quiz' },
  { name: 'Concept Master', desc: 'Scan practice' },
  { name: 'Rising Scholar', desc: 'Scan practice' },
  { name: 'Task Master', desc: 'All homework done' },
  { name: 'GK Starter', desc: 'GK easy' },
  { name: 'GK Explorer', desc: 'GK medium' },
  { name: 'GK Champion', desc: 'GK hard' },
]

export const initialAttendance: AttendanceRecord[] = []
export const initialTasks: HomeworkTask[] = []
export const initialGrades: StudentGrade[] = []
export const initialRoster: RosterStudent[] = []
export const initialFees: FeeItem[] = []
export const initialPaymentHistory: PaymentRecord[] = []
export const initialBroadcasts: BroadcastMessage[] = []
export const initialCalendar: CalendarEvent[] = []
export const initialLeaves: LeaveRequest[] = []
export const initialCurriculum: SyllabusChapter[] = []
export const initialCandidates: Candidate[] = []
export const initialFleet: FleetBus[] = []
export const initialNotifications: NotificationItem[] = []
export const initialCompetitions: OrbitCompetition[] = []
export const initialCompetitionEnrollments: CompetitionEnrollment[] = []
export const schoolTeachers: TeacherProfile[] = []
export const softSkills: SoftSkill[] = []
export const subjectProgressHistory: Record<
  string,
  { exams: string[]; marks: number[]; classAvg: number[]; ranks: number[] }
> = {
  chemLabSubject: { exams: [], marks: [], classAvg: [], ranks: [] },
  mathSubject: { exams: [], marks: [], classAvg: [], ranks: [] },
  scienceSubject: { exams: [], marks: [], classAvg: [], ranks: [] },
}
export const teacherVacancies: {
  id: number
  title: string
  school: string
  pay: string
  match: string
  matchPct: number
}[] = []
export const extracurricularListing: Record<
  string,
  { title: string; coach: string; phone: string; cost: string; loc: string }[]
> = {}
export const remediationTemplates: Record<
  string,
  {
    title: string
    flaggedWeakness: string
    analysisText: string
    modelEscalation: string
    confidence: number
    analogyText: string
    validationQuestion: string
    options: string[]
    correctIndex: number
    successToast: string
  }
> = {
  chemistry: {
    title: 'Practice sheet',
    flaggedWeakness: 'Review the core idea',
    analysisText: 'Offline coach placeholder.',
    modelEscalation: 'offline',
    confidence: 50,
    analogyText: '',
    validationQuestion: 'Which step comes next?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    successToast: 'Practice complete',
  },
  mathematics: {
    title: 'Practice sheet',
    flaggedWeakness: 'Review the core idea',
    analysisText: 'Offline coach placeholder.',
    modelEscalation: 'offline',
    confidence: 50,
    analogyText: '',
    validationQuestion: 'Which step comes next?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    successToast: 'Practice complete',
  },
  science: {
    title: 'Practice sheet',
    flaggedWeakness: 'Review the core idea',
    analysisText: 'Offline coach placeholder.',
    modelEscalation: 'offline',
    confidence: 50,
    analogyText: '',
    validationQuestion: 'Which step comes next?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    successToast: 'Practice complete',
  },
  english: {
    title: 'Practice sheet',
    flaggedWeakness: 'Review the core idea',
    analysisText: 'Offline coach placeholder.',
    modelEscalation: 'offline',
    confidence: 50,
    analogyText: '',
    validationQuestion: 'Which step comes next?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    successToast: 'Practice complete',
  },
  physics: {
    title: 'Practice sheet',
    flaggedWeakness: 'Review the core idea',
    analysisText: 'Offline coach placeholder.',
    modelEscalation: 'offline',
    confidence: 50,
    analogyText: '',
    validationQuestion: 'Which step comes next?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
    successToast: 'Practice complete',
  },
}
export const timetableByDay: Record<
  string,
  {
    theory: {
      id: string
      code: string
      name: string
      start: string
      end: string
      room: string
      teacher: string
    }[]
    lab: {
      id: string
      code: string
      name: string
      start: string
      end: string
      room: string
      teacher: string
    }[]
  }
> = {
  MON: { theory: [], lab: [] },
  TUE: { theory: [], lab: [] },
  WED: { theory: [], lab: [] },
  THU: { theory: [], lab: [] },
  FRI: { theory: [], lab: [] },
  SAT: { theory: [], lab: [] },
}
export const FALLBACK_QUIZ = {
  title: 'Recap',
  topic: 'General',
  questions: [
    {
      id: 1,
      question: 'Which habit helps most before a test?',
      options: ['Cram overnight', 'Short spaced review', 'Skip sleep', 'Ignore notes'],
      answerIndex: 1,
    },
  ],
}
export const offlineAiAnswers: Record<string, string> = {
  default: 'I can help once you are online with Orbit AI.',
}

export const initialStudentProfile: StudentAcademicProfile = {
  photoUrl: '',
  name: '',
  school: '',
  grade: '',
  interests: [],
  subjects: [],
  skills: [],
  languages: [],
  hobbies: [],
  sports: [],
  certifications: [],
  achievements: [],
  competitions: [],
  projects: [],
  clubs: [],
  milestones: [],
}

export const initialTeacherAcademicProfile: TeacherAcademicProfile = {
  photoUrl: '',
  name: '',
  school: '',
  employeeId: '',
  phone: '',
  email: '',
  subjects: [],
  classes: [],
  qualifications: [],
  achievements: [],
  certifications: [],
}
