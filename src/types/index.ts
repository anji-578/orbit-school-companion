export type Role = 'student' | 'parent' | 'teacher' | 'school'
export type Lang = 'en' | 'te'
export type AttendanceStatus = 'Present' | 'Absent'
export type LeaveStatus = 'Reviewing' | 'Approved' | 'Declined'
export type FeeStatus = 'Unpaid' | 'Pending' | 'Overdue' | 'Paid'
export type PaymentSubmissionStatus = 'Pending' | 'Verified' | 'Rejected'
export type ScanStep = 'select' | 'scanning' | 'evaluated' | 'analogy' | 'validated'
export type ScanTarget = 'chemistry' | 'mathematics'
export type LifecycleMetric = 'marks' | 'ranks'
export type PaymentMethod = 'upi' | 'card'

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
  isDemo?: boolean
}

export interface FeeItem {
  id: number
  name: string
  amount: number
  status: FeeStatus
  category: string
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
  id: number
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
}
