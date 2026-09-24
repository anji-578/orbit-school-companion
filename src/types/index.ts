export type Role = 'student' | 'parent' | 'teacher' | 'school'
export type Lang = 'en' | 'te'
export type ThemeMode = 'dark' | 'light'
export type AttendanceStatus = 'Present' | 'Absent'
export type LeaveStatus = 'Reviewing' | 'Approved' | 'Declined'
export type FeeStatus = 'Unpaid' | 'Pending' | 'Overdue' | 'Paid'
export type PaymentSubmissionStatus = 'Pending' | 'Verified' | 'Rejected'
export type ScanStep = 'select' | 'scanning' | 'evaluated' | 'analogy' | 'validated'
export type ScanTarget = 'chemistry' | 'mathematics' | 'science' | 'english' | 'physics'

export interface PaperCoachInsight {
  title: string
  subject: string
  overallQuality: 'strong' | 'mixed' | 'needs_work'
  confidence: number
  summary: string
  workingWell: string[]
  needsImprovement: string[]
  flaggedWeakness: string
  nextSteps: string[]
  checkQuestion: string
  checkOptions: string[]
  checkAnswerIndex: number
  model?: string
  source: 'live' | 'offline'
}

export type LifecycleMetric = 'marks' | 'ranks'
export type PaymentMethod = 'upi' | 'razorpay'

export interface AttendanceRecord {
  date: string
  day: string
  status: AttendanceStatus
  reason?: string
}

export interface HomeworkTask {
  id: number
  subject: string
  task: string
  due: string
  xp: number
  completed: boolean
  difficulty: 'Easy' | 'Medium' | 'Hard'
  /** Estimated minutes to finish; derived from difficulty when omitted. */
  estimatedMinutes?: number
  /** Student has opened / started the task. */
  started?: boolean
}

export type CompetitionCategory =
  | 'Quiz'
  | 'Spell Bee'
  | 'Drawing'
  | 'Coding'
  | 'Chess'
  | 'Debate'
  | 'Public Speaking'
  | 'Mathematics'
  | 'Science'
  | 'Sports'
  | 'Karate'
  | 'Music'

export type CompetitionEnrollmentStatus = 'registered' | 'paid' | 'participated' | 'result'

export interface ProfileListItem {
  id: string
  title: string
  subtitle?: string
  date?: string
  meta?: string
  /** When set, this entry was auto-fed from an Orbit competition. */
  sourceCompetitionId?: string
}

export interface StudentAcademicProfile {
  photoUrl: string
  name: string
  school: string
  grade: string
  interests: string[]
  subjects: string[]
  skills: string[]
  languages: string[]
  hobbies: string[]
  sports: string[]
  certifications: ProfileListItem[]
  achievements: ProfileListItem[]
  competitions: ProfileListItem[]
  projects: ProfileListItem[]
  clubs: ProfileListItem[]
  milestones: ProfileListItem[]
}

export type ConfidentialDocCategory =
  | 'Birth Certificate'
  | 'ID / Aadhaar'
  | 'Report Card'
  | 'Medical'
  | 'Passport'
  | 'Admission'
  | 'Lesson Plan'
  | 'Certificates'
  | 'Other'

export interface ConfidentialDocument {
  id: string
  title: string
  category: ConfidentialDocCategory
  fileName: string
  mimeType: string
  sizeBytes: number
  /** Cloud storage object path, or local IndexedDB key. */
  storagePath: string
  createdAt: string
  storage: 'cloud' | 'local'
}

export interface OrbitCompetition {
  id: string
  title: string
  category: CompetitionCategory
  city: string
  priceInr: number
  date: string
  participantCount: number
  description: string
  totalSlots: number
}

export interface CompetitionEnrollment {
  competitionId: string
  status: CompetitionEnrollmentStatus
  registeredAt: string
  paidAt?: string
  participatedAt?: string
  rank?: number
  totalParticipants?: number
  resultPostedAt?: string
}

export interface StudentGrade {
  id: string
  name: string
  math: string
  science: string
  chem: string
  comment: string
}

export interface RosterStudent {
  id: string
  name: string
  present: boolean
  /** False when no attendance row exists for today (not yet marked). */
  marked?: boolean
  rollNo?: string
  className?: string
  section?: string | null
  classLabel?: string
  /** Soft-deactivate flag; omitted/true = enrolled. */
  active?: boolean
  isDemo?: boolean
}

export interface FeeItem {
  id: string
  name: string
  amount: number
  status: FeeStatus
  category: string
  /** Present when cloud-hydrated; used by school class ledger. */
  studentId?: string
  studentName?: string
  className?: string
  section?: string | null
  rollNo?: string
}

export interface PaymentRecord {
  id: number
  name: string
  amount: number
  status: 'Paid'
  date: string
  receiptId: string
}

export interface NotificationItem {
  id: number
  role: Role | 'all'
  title: string
  body: string
  unread: boolean
  time: string
  /** When set, alert is scoped to this child (parent/student RLS). */
  studentId?: string
}

export interface BroadcastMessage {
  id: number
  target: string
  title: string
  content: string
  date: string
}

export interface CalendarEvent {
  id: number
  title: string
  category: 'Exams' | 'Holidays' | 'PTA Meetings' | 'Extracurricular'
  date: string
}

export interface LeaveRequest {
  id: number
  reason: string
  date: string
  status: LeaveStatus
  teacherName?: string
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  answerIndex: number
}

export interface QuizPayload {
  topic: string
  questions: QuizQuestion[]
}

export type GkDifficulty = 'easy' | 'medium' | 'hard'

export interface GkQuestion {
  id: string
  difficulty: GkDifficulty
  category: string
  question: string
  options: string[]
  answerIndex: number
  explanation?: string
}

export interface GkLevelStats {
  bestScore: number
  bestTotal: number
  attempts: number
  passed: boolean
  lastPlayedAt?: string
}

export interface GkQuizProgress {
  easy: GkLevelStats
  medium: GkLevelStats
  hard: GkLevelStats
  roundsCompleted: number
}

export interface SoftSkill {
  label: string
  score: number
}

export interface SyllabusTopic {
  name: string
  scoring: number
  strength: 'High' | 'Needs Practice'
  subtopics: string[]
  quizQuery: string
  mistakeText: string
}

/** Shared teacher ↔ student curriculum unit. */
export interface SyllabusSubtopic {
  id: string
  title: string
  done: boolean
  completedAt?: string
  noteName?: string
  noteDataUrl?: string
  noteMime?: string
  noteUploadedAt?: string
  /** Optional curated or teacher-set YouTube lesson URL. */
  youtubeUrl?: string
  /** Optional summary / revision sheet URL (http or data URL). */
  revisionNotesUrl?: string
  revisionNotesName?: string
}

export interface SyllabusChapter {
  id: string
  subject: string
  subjectKey: string
  title: string
  plannedDate: string
  quizQuery: string
  subtopics: SyllabusSubtopic[]
}

export interface ClassSlot {
  id: string
  code: string
  name: string
  start: string
  end: string
  room: string
  teacher: string
  type: 'Theory' | 'Lab'
  status: 'Completed' | 'Live' | 'Upcoming'
}

export interface TeacherProfile {
  id: string
  name: string
  subjectKey: string
  qualification: string
  phone: string
  avatar: string
}

/** Editable teacher identity used in the Teacher Profile tab. */
export interface TeacherAcademicProfile {
  photoUrl: string
  name: string
  school: string
  employeeId: string
  phone: string
  email: string
  subjects: string[]
  classes: string[]
  qualifications: ProfileListItem[]
  achievements: ProfileListItem[]
  certifications: ProfileListItem[]
}

export interface CoachingItem {
  title: string
  coach: string
  phone: string
  cost: string
  loc: string
}

export interface FleetBus {
  id: string
  route: string
  active: boolean
  driver: string
  phone: string
  position: number
  speed: number
  capacity: string
}

export interface JobVacancy {
  id: number
  title: string
  school: string
  pay: string
  match: string
  matchPct: number
}

export interface Candidate {
  id: string | number
  name: string
  subject: string
  experience: string
  qualification: string
  status: string
}

export interface PaymentReceipt {
  id: string
  date: string
  amount: number
  ref: string
}

export interface SchoolPaymentSettings {
  upiId: string
  accountName: string
  bankName: string
  ifsc: string
  instructions: string
}

export interface PaymentSubmission {
  id: string
  amount: number
  utr: string
  paidOn: string
  note: string
  payerName: string
  status: PaymentSubmissionStatus
  createdAt: string
  /** Linked child when parent/student submitted; used to clear the right ledger. */
  studentId?: string | null
  studentName?: string | null
}
