import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ALL_BADGES,
  initialAttendance,
  initialBroadcasts,
  initialCalendar,
  initialCandidates,
  initialCurriculum,
  initialFees,
  initialFleet,
  initialGrades,
  initialLeaves,
  initialNotifications,
  initialPaymentHistory,
  initialRoster,
  initialTasks,
} from '../data/demo'
import { computeStudyScore } from '../lib/studyScore'
import { dispatchRemoteAlert, eventTypeFromNotification } from '../lib/alerts'
import { resolveClassLinked } from '../lib/classLink'
import { childFirstName, fetchLinkedStudent, type LinkedStudent } from '../lib/linkedStudent'
import { currentDayCode, fetchTimetableByDay, getLocalTimetable, saveTimetableWeek, type TimetableByDay } from '../lib/timetableApi'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import {
  createPaymentSubmission,
  fetchPaymentSubmissions,
  fetchSchoolPaymentSettings,
  reviewPaymentSubmission,
  saveSchoolPaymentSettings,
} from '../lib/paymentsApi'
import {
  loadSchoolOpsSnapshot,
  syncAssignHomework,
  syncBroadcast,
  syncCalendarEvent,
  syncSetLeaveStatus,
  syncSubmitLeave,
  syncToggleHomework,
} from '../lib/schoolOpsApi'
import {
  claimDemoLinks,
  fetchAttendanceHistory,
  fetchRosterWithTodayAttendance,
  upsertAttendanceMark,
} from '../lib/attendanceApi'
import { fetchStudentGrades, saveStudentGrades } from '../lib/gradesApi'
import { fetchFeeItems, markAllFeesPaid, markFeeItemsStatus } from '../lib/feesApi'
import { deleteSyllabusNoteFile, fetchSyllabusState, mergeCurriculum, saveSyllabusState, uploadSyllabusNoteFile } from '../lib/syllabusApi'
import {
  fetchAppNotifications,
  insertAppNotification,
  markAllAppNotificationsRead,
  markAppNotificationRead,
} from '../lib/notificationsApi'
import { evaluatePaperCoach, fileToVisionPayload, getDemoInsight } from '../lib/paperCoach'
import type {
  AttendanceRecord,
  BroadcastMessage,
  CalendarEvent,
  Candidate,
  FeeItem,
  FleetBus,
  HomeworkTask,
  Lang,
  LeaveRequest,
  LeaveStatus,
  NotificationItem,
  PaperCoachInsight,
  PaymentMethod,
  PaymentReceipt,
  PaymentRecord,
  PaymentSubmission,
  QuizPayload,
  Role,
  RosterStudent,
  ScanStep,
  ScanTarget,
  SchoolPaymentSettings,
  StudentGrade,
  SyllabusChapter,
  ThemeMode,
} from '../types'

function attendancePercent(records: AttendanceRecord[]) {
  if (!records.length) return 100
  const present = records.filter((r) => r.status === 'Present').length
  return Math.round((present / records.length) * 100)
}

function homeworkPercent(tasks: HomeworkTask[]) {
  if (!tasks.length) return 100
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
}

export function chapterProgress(chapter: SyllabusChapter) {
  if (!chapter.subtopics.length) return 0
  const done = chapter.subtopics.filter((s) => s.done).length
  return Math.round((done / chapter.subtopics.length) * 100)
}

export function curriculumProgress(chapters: SyllabusChapter[]) {
  const all = chapters.flatMap((c) => c.subtopics)
  if (!all.length) return 0
  return Math.round((all.filter((s) => s.done).length / all.length) * 100)
}

interface OrbitState {
  role: Role
  lang: Lang
  theme: ThemeMode
  activeTab: string
  mobileMenuOpen: boolean
  mobileSimulator: boolean
  notifOpen: boolean
  toast: string | null

  attendanceRecords: AttendanceRecord[]
  tasks: HomeworkTask[]
  studentGrades: StudentGrade[]
  roster: RosterStudent[]
  unlockedBadges: string[]
  totalXp: number

  fees: FeeItem[]
  paymentHistory: PaymentRecord[]
  outstandingFees: number
  paymentMethod: PaymentMethod
  paymentProcessing: boolean
  paymentReceipt: PaymentReceipt | null
  upiId: string
  schoolPaymentSettings: SchoolPaymentSettings
  paymentSubmissions: PaymentSubmission[]

  broadcasts: BroadcastMessage[]
  calendarEvents: CalendarEvent[]
  leaves: LeaveRequest[]
  curriculum: SyllabusChapter[]
  timetableByDay: TimetableByDay
  candidates: Candidate[]
  fleet: FleetBus[]
  notifications: NotificationItem[]

  busPosition: number
  busReachedSchool: boolean

  aiPrompt: string
  aiResponse: string
  aiLoading: boolean
  aiSource: 'live' | 'offline' | null
  quizMode: boolean
  activeQuiz: QuizPayload | null
  selectedAnswers: Record<number, number>
  quizScore: number | null
  isListening: boolean
  isSpeaking: boolean

  scanStep: ScanStep
  scanTarget: ScanTarget
  scanModel: string
  scanConfidence: number
  scanInsight: PaperCoachInsight | null
  scanPreviewUrl: string | null
  scanError: string | null
  remediationMarkdown: string
  remediationLoading: boolean
  remediationSource: 'live' | 'offline' | null
  selectedValidationAnswer: number | null
  validationSubmitted: boolean

  selectedGanttDay: string
  selectedLifecycleSubject: string
  selectedLifecycleMetric: 'marks' | 'ranks'

  studyScore: number
  classLinked: boolean
  /** Resolved child for parent/student views; null when unlinked. */
  linkedStudent: LinkedStudent | null
  /** True when Supabase is configured — empty remote arrays must not fall back to demo seed. */
  usingCloudData: boolean
  getAttendancePercent: () => number

  setRole: (role: Role) => void
  setLang: (lang: Lang) => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setActiveTab: (tab: string) => void
  setMobileMenuOpen: (open: boolean) => void
  setMobileSimulator: (open: boolean) => void
  setNotifOpen: (open: boolean) => void
  triggerToast: (message: string) => void
  clearToast: () => void

  pushNotification: (n: Omit<NotificationItem, 'id' | 'time' | 'unread'> & { unread?: boolean }) => void
  markNotificationRead: (id: number) => void
  markAllNotificationsRead: () => void

  toggleAttendanceDate: (date: string) => void
  toggleRosterPresent: (id: string) => void
  broadcastAbsentees: () => void
  toggleTask: (id: number) => void
  assignHomework: (input: {
    subject: string
    task: string
    due: string
    xp: number
    difficulty: HomeworkTask['difficulty']
  }) => void
  updateGrade: (id: string, patch: Partial<StudentGrade>) => void
  saveGrades: () => void

  setPaymentMethod: (m: PaymentMethod) => void
  setUpiId: (v: string) => void
  nudgeFeeParents: () => void
  setSchoolPaymentSettings: (patch: Partial<SchoolPaymentSettings>) => void
  loadPaymentWorkspace: () => Promise<void>
  hydrateFromSupabase: () => Promise<void>
  refreshNotifications: () => Promise<void>
  submitUtrPayment: (input: {
    amount: number
    utr: string
    paidOn: string
    note: string
    payerName: string
    userId?: string
  }) => Promise<boolean>
  reviewUtrPayment: (id: string, status: 'Verified' | 'Rejected', reviewerId?: string) => Promise<void>
  persistSchoolPaymentSettings: () => Promise<void>

  submitLeave: (date: string, reason: string, teacherName?: string) => void
  setLeaveStatus: (id: number, status: LeaveStatus) => void
  toggleSyllabusSubtopic: (chapterId: string, subtopicId: string) => void
  uploadSyllabusNote: (chapterId: string, subtopicId: string, file: File) => Promise<void>
  clearSyllabusNote: (chapterId: string, subtopicId: string) => void
  submitBroadcast: (title: string, target: string, content: string) => void
  addCalendarEvent: (title: string, category: CalendarEvent['category'], date: string) => void
  scheduleInterview: (id: number) => void

  tickBus: () => void
  resetDemoData: () => void

  setAiPrompt: (v: string) => void
  setAiLoading: (v: boolean) => void
  setAiResult: (text: string, source: 'live' | 'offline') => void
  setQuiz: (quiz: QuizPayload | null, source?: 'live' | 'offline') => void
  setSelectedAnswer: (qIdx: number, optIdx: number) => void
  submitQuiz: () => void
  setListening: (v: boolean) => void
  setSpeaking: (v: boolean) => void
  clearAiPanel: () => void

  startScan: (target: ScanTarget) => void
  evaluatePaperScan: (target: ScanTarget, file: File) => Promise<void>
  finishScanEvaluation: () => void
  setRemediation: (md: string, source: 'live' | 'offline') => void
  setRemediationLoading: (v: boolean) => void
  setScanStep: (step: ScanStep) => void
  setValidationAnswer: (idx: number | null) => void
  submitValidation: () => void
  resetScanner: () => void

  setGanttDay: (day: string) => void
  saveTimetable: (className: string, week: TimetableByDay) => Promise<boolean>
  setLifecycleSubject: (key: string) => void
  setLifecycleMetric: (m: 'marks' | 'ranks') => void
  unlockBadge: (name: string) => void
  addXp: (amount: number) => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useOrbitStore = create<OrbitState>()(
  persist(
    (set, get) => ({
      role: 'student',
      lang: 'en',
      theme: 'dark',
      activeTab: 'dashboard',
      mobileMenuOpen: false,
      mobileSimulator: false,
      notifOpen: false,
      toast: null,

      attendanceRecords: initialAttendance,
      tasks: initialTasks,
      studentGrades: initialGrades,
      roster: initialRoster,
      unlockedBadges: ['Streak Keeper', 'Early Bird', 'Curious Mind'],
      totalXp: 430,

      fees: initialFees,
      paymentHistory: initialPaymentHistory,
      outstandingFees: 42500,
      paymentMethod: 'upi',
      paymentProcessing: false,
      paymentReceipt: null,
      upiId: '',
      schoolPaymentSettings: {
        upiId: 'sunrise.school@oksbi',
        accountName: 'Sunrise Public School',
        bankName: 'Demo Bank',
        ifsc: '',
        instructions: 'Pay the exact outstanding amount via UPI, then submit the UTR here. ₹0 gateway fee.',
      },
      paymentSubmissions: [],

      broadcasts: initialBroadcasts,
      calendarEvents: initialCalendar,
      leaves: initialLeaves,
      curriculum: initialCurriculum,
      timetableByDay: getLocalTimetable(),
      candidates: initialCandidates,
      fleet: initialFleet,
      notifications: initialNotifications,

      busPosition: 40,
      busReachedSchool: false,

      aiPrompt: "Explain Newton's Second Law with a simple sports analogy",
      aiResponse: '',
      aiLoading: false,
      aiSource: null,
      quizMode: false,
      activeQuiz: null,
      selectedAnswers: {},
      quizScore: null,
      isListening: false,
      isSpeaking: false,

      scanStep: 'select',
      scanTarget: 'chemistry',
      scanModel: 'Gemini Flash (coach)',
      scanConfidence: 82,
      scanInsight: null,
      scanPreviewUrl: null,
      scanError: null,
      remediationMarkdown: '',
      remediationLoading: false,
      remediationSource: null,
      selectedValidationAnswer: null,
      validationSubmitted: false,

      selectedGanttDay: currentDayCode(),
      selectedLifecycleSubject: 'chemLabSubject',
      selectedLifecycleMetric: 'marks',

      studyScore: computeStudyScore(attendancePercent(initialAttendance), homeworkPercent(initialTasks)),
      classLinked: true,
      linkedStudent: null,
      usingCloudData: false,

      getAttendancePercent: () => attendancePercent(get().attendanceRecords),

      setRole: (role) => set({ role, activeTab: 'dashboard', mobileMenuOpen: false, notifOpen: false }),
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setActiveTab: (activeTab) => set({ activeTab, mobileMenuOpen: false }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setMobileSimulator: (mobileSimulator) => set({ mobileSimulator }),
      setNotifOpen: (notifOpen) => set({ notifOpen }),

      triggerToast: (message) => {
        if (toastTimer) clearTimeout(toastTimer)
        set({ toast: message })
        toastTimer = setTimeout(() => set({ toast: null }), 4200)
      },
      clearToast: () => set({ toast: null }),

      pushNotification: (n) => {
        const localId = Date.now()
        set((s) => ({
          notifications: [
            { id: localId, time: 'Just now', unread: n.unread ?? true, role: n.role, title: n.title, body: n.body },
            ...s.notifications,
          ],
        }))
        const eventType = eventTypeFromNotification(n.title, n.body)
        void insertAppNotification({
          title: n.title,
          body: n.body,
          role: n.role,
          eventType,
        }).then((remoteId) => {
          if (remoteId) {
            set((s) => ({
              notifications: s.notifications.map((item) =>
                item.id === localId ? { ...item, id: remoteId } : item,
              ),
            }))
          }
        })
        dispatchRemoteAlert({
          eventType,
          title: n.title,
          body: n.body,
          role: n.role,
        })
      },

      markNotificationRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        }))
        void markAppNotificationRead(id)
      },

      markAllNotificationsRead: () => {
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, unread: false })) }))
        void markAllAppNotificationsRead()
      },

      refreshNotifications: async () => {
        if (!isSupabaseConfigured()) return
        const remote = await fetchAppNotifications()
        if (!remote.length) return
        set((s) => {
          const localOnly = s.notifications.filter((n) => !remote.some((r) => r.id === n.id))
          const merged = [...remote, ...localOnly].slice(0, 50)
          return { notifications: merged }
        })
      },

      toggleAttendanceDate: (date) => {
        set((s) => {
          const attendanceRecords = s.attendanceRecords.map((rec) => {
            if (rec.date !== date) return rec
            const status = rec.status === 'Present' ? 'Absent' : 'Present'
            return {
              ...rec,
              status: status as AttendanceRecord['status'],
              reason: status === 'Absent' ? 'Manual toggle' : undefined,
            }
          })
          const studyScore = computeStudyScore(attendancePercent(attendanceRecords), homeworkPercent(s.tasks))
          return { attendanceRecords, studyScore }
        })
      },

      toggleRosterPresent: (id) => {
        const state = get()
        const student = state.roster.find((r) => r.id === id)
        if (!student) return

        const nextPresent = !student.present
        set({
          roster: state.roster.map((r) => (r.id === id ? { ...r, present: nextPresent } : r)),
        })
        void upsertAttendanceMark(id, nextPresent)

        // Cross-role sync for demo student Ananya (and any isDemo flag)
        if (student.isDemo) {
          const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' })
          set((s) => {
            const records = [...s.attendanceRecords]
            const last = records[records.length - 1]
            const nextRec = {
              date: todayLabel,
              day: todayDay,
              status: (nextPresent ? 'Present' : 'Absent') as AttendanceRecord['status'],
              reason: nextPresent ? undefined : 'Marked absent by class teacher',
            }
            if (last && last.date === todayLabel) {
              records[records.length - 1] = nextRec
            } else {
              records.push(nextRec)
            }
            return {
              attendanceRecords: records,
              studyScore: computeStudyScore(attendancePercent(records), homeworkPercent(s.tasks)),
            }
          })
          get().pushNotification({
            role: 'parent',
            title: nextPresent ? 'Attendance: Present' : 'Attendance Alert',
            body: `${student.name} marked ${nextPresent ? 'Present' : 'Absent'} in Class 11-A.`,
          })
          get().pushNotification({
            role: 'student',
            title: 'Attendance updated',
            body: `Your status is now ${nextPresent ? 'Present' : 'Absent'} for today.`,
          })
          get().triggerToast(
            `Synced: ${student.name} marked ${nextPresent ? 'Present' : 'Absent'} across Student + Parent nodes.`,
          )
        }
      },

      broadcastAbsentees: () => {
        const absentees = get().roster.filter((s) => !s.present)
        if (!absentees.length) {
          get().triggerToast('All students present — no alerts needed.')
          return
        }
        absentees.forEach((s) => {
          get().pushNotification({
            role: 'parent',
            title: 'Absentee Alert',
            body: `${s.name} was marked absent today. Please confirm.`,
          })
        })
        get().triggerToast(
          `Alerts queued for: ${absentees.map((a) => a.name).join(', ')} (in-app + push/SMS if enabled)`,
        )
      },

      assignHomework: ({ subject, task, due, xp, difficulty }) => {
        const entry: HomeworkTask = {
          id: Date.now(),
          subject,
          task,
          due,
          xp,
          difficulty,
          completed: false,
        }
        set((s) => {
          const tasks = [entry, ...s.tasks]
          const studyScore = computeStudyScore(attendancePercent(s.attendanceRecords), homeworkPercent(tasks))
          return { tasks, studyScore }
        })
        void syncAssignHomework(entry).then((remoteId) => {
          if (remoteId) {
            set((s) => ({
              tasks: s.tasks.map((t) => (t.id === entry.id ? { ...t, id: remoteId } : t)),
            }))
          }
        })
        get().pushNotification({
          role: 'student',
          title: 'New homework',
          body: `${subject}: ${task} · due ${due}`,
        })
        get().pushNotification({
          role: 'parent',
          title: 'Homework assigned',
          body: `${childFirstName(get().linkedStudent)} received: ${task} (${subject})`,
        })
        const classLabel = get().linkedStudent?.className
        get().triggerToast(
          `Homework assigned${classLabel ? ` · ${classLabel}` : ''} · student & parent notified.`,
        )
      },

      toggleTask: (id) => {
        const before = get().tasks.find((t) => t.id === id)
        set((s) => {
          const tasks = s.tasks.map((task) => {
            if (task.id !== id) return task
            return { ...task, completed: !task.completed }
          })
          const toggled = s.tasks.find((t) => t.id === id)
          let totalXp = s.totalXp
          let unlockedBadges = s.unlockedBadges
          if (toggled) {
            totalXp = Math.max(0, totalXp + (toggled.completed ? -toggled.xp : toggled.xp))
          }
          if (tasks.every((t) => t.completed) && !unlockedBadges.includes('Task Master')) {
            unlockedBadges = [...unlockedBadges, 'Task Master']
            queueMicrotask(() => get().triggerToast('All homework complete — Task Master unlocked!'))
          }
          const studyScore = computeStudyScore(attendancePercent(s.attendanceRecords), homeworkPercent(tasks))
          return { tasks, totalXp, unlockedBadges, studyScore }
        })
        if (before) {
          void syncToggleHomework(id, !before.completed, get().linkedStudent?.id)
        }
      },

      updateGrade: (id, patch) =>
        set((s) => ({
          studentGrades: s.studentGrades.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      saveGrades: () => {
        const grades = get().studentGrades
        void saveStudentGrades(grades).then((result) => {
          if (!result.ok) {
            get().triggerToast(result.error ?? 'Could not save marks to cloud.')
            return
          }
          get().pushNotification({
            role: 'student',
            title: 'Marks updated',
            body: 'Your teacher saved new midterm scores and diagnostic notes.',
          })
          get().pushNotification({
            role: 'parent',
            title: 'Report card updated',
            body: `${childFirstName(get().linkedStudent)}'s marks and teacher comments were updated.`,
          })
          get().triggerToast('Marks saved and synced to Student + Parent portals.')
        })
      },

      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setUpiId: (upiId) => set({ upiId }),

      nudgeFeeParents: () => {
        get().pushNotification({
          role: 'parent',
          title: 'Fee reminder',
          body: 'School accounts nudged families with pending dues.',
        })
        get().triggerToast('Fee reminder notifications queued for pending accounts.')
      },

      setSchoolPaymentSettings: (patch) =>
        set((s) => ({ schoolPaymentSettings: { ...s.schoolPaymentSettings, ...patch } })),

      loadPaymentWorkspace: async () => {
        const cloud = isSupabaseConfigured()
        const [settings, submissions, fees] = await Promise.all([
          fetchSchoolPaymentSettings(),
          fetchPaymentSubmissions(),
          fetchFeeItems(),
        ])
        const outstandingFees = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0)
        set((s) => ({
          schoolPaymentSettings: settings,
          paymentSubmissions: cloud
            ? submissions.filter((p) => !p.id.startsWith('local_'))
            : submissions.length
              ? submissions
              : s.paymentSubmissions.filter((p) => !p.id.startsWith('local_')),
          fees: cloud ? fees : fees.length ? fees : s.fees,
          outstandingFees: cloud ? outstandingFees : fees.length ? outstandingFees : s.outstandingFees,
        }))
      },

      hydrateFromSupabase: async () => {
        const cloud = isSupabaseConfigured()
        await claimDemoLinks()
        const sessionEmail = (await getSupabase()?.auth.getUser())?.data.user?.email ?? ''
        const role = get().role
        const classLinked = await resolveClassLinked(sessionEmail, role)
        const linkedStudent = await fetchLinkedStudent(sessionEmail, role)
        const timetableClass =
          linkedStudent?.className && linkedStudent.section
            ? `${linkedStudent.className}-${linkedStudent.section}`
            : 'Grade 8-A'
        const [ops, roster, attendanceRecords, studentGrades, remoteSyllabus, timetableByDay] = await Promise.all([
          loadSchoolOpsSnapshot(linkedStudent?.id),
          fetchRosterWithTodayAttendance(),
          fetchAttendanceHistory(),
          fetchStudentGrades(linkedStudent?.id),
          fetchSyllabusState(),
          fetchTimetableByDay(timetableClass),
          get().loadPaymentWorkspace(),
        ])
        await get().refreshNotifications()
        set((s) => {
          const tasks = cloud ? (ops.tasks ?? []) : (ops.tasks ?? s.tasks)
          const nextAttendance = cloud
            ? attendanceRecords
            : attendanceRecords.length
              ? attendanceRecords
              : s.attendanceRecords
          const curriculum = cloud
            ? mergeCurriculum(remoteSyllabus, s.curriculum)
            : remoteSyllabus?.length
              ? mergeCurriculum(remoteSyllabus, s.curriculum)
              : s.curriculum
          return {
            usingCloudData: cloud,
            classLinked,
            linkedStudent,
            tasks,
            leaves: cloud ? (ops.leaves ?? []) : (ops.leaves ?? s.leaves),
            broadcasts: cloud ? (ops.broadcasts ?? []) : (ops.broadcasts ?? s.broadcasts),
            calendarEvents: cloud ? (ops.calendarEvents ?? []) : (ops.calendarEvents ?? s.calendarEvents),
            roster: cloud ? roster : roster.length ? roster : s.roster,
            attendanceRecords: nextAttendance,
            studentGrades: cloud ? studentGrades : studentGrades.length ? studentGrades : s.studentGrades,
            curriculum,
            timetableByDay:
              cloud || Object.values(timetableByDay).some((d) => d.theory.length + d.lab.length > 0)
                ? timetableByDay
                : s.timetableByDay,
            studyScore: computeStudyScore(attendancePercent(nextAttendance), homeworkPercent(tasks)),
          }
        })
      },

      submitUtrPayment: async (input) => {
        if (!input.utr.trim() || input.amount <= 0) {
          get().triggerToast('Enter a valid UTR and amount.')
          return false
        }
        const result = await createPaymentSubmission(input)
        if (!result.ok) {
          get().triggerToast(result.error)
          return false
        }
        const studentId = result.submission.studentId
        set((s) => {
          const fees = s.fees.map((f) => {
            const sameChild = !studentId || !f.studentId || f.studentId === studentId
            return sameChild && f.status !== 'Paid' ? { ...f, status: 'Pending' as const } : f
          })
          return {
            paymentSubmissions: [result.submission, ...s.paymentSubmissions],
            fees,
            outstandingFees: fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0),
          }
        })
        void markFeeItemsStatus('Pending', studentId)
        get().pushNotification({
          role: 'school',
          title: 'UTR payment submitted',
          body: `${input.payerName || 'Parent'} submitted UTR ${input.utr} for ₹${input.amount.toLocaleString()}.`,
        })
        get().pushNotification({
          role: 'parent',
          title: 'Payment under review',
          body: `UTR ${input.utr} submitted. School will verify shortly.`,
        })
        get().triggerToast('UTR submitted for school verification.')
        return true
      },

      reviewUtrPayment: async (id, status, reviewerId) => {
        const target = get().paymentSubmissions.find((p) => p.id === id)
        const result = await reviewPaymentSubmission(id, status, reviewerId)
        if (!result.ok) {
          get().triggerToast(result.error ?? 'Could not update payment on server.')
          return
        }

        if (status !== 'Verified') {
          set((s) => ({
            paymentSubmissions: s.paymentSubmissions.map((p) => (p.id === id ? { ...p, status } : p)),
          }))
          get().pushNotification({
            role: 'parent',
            title: 'Payment rejected',
            body: 'School could not verify the UTR. Please check and resubmit.',
          })
          get().triggerToast('Payment marked rejected.')
          return
        }

        const amount = target?.amount ?? 0
        const studentId = target?.studentId
        const receiptId = `UTR-${Math.floor(10000 + Math.random() * 90000)}`
        const date = new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        })

        set((s) => {
          const fees = s.fees.map((f) => {
            if (studentId && f.studentId && f.studentId !== studentId) return f
            if (!studentId && f.studentId) return f
            return { ...f, status: 'Paid' as const }
          })
          const outstandingFees = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0)
          return {
            paymentSubmissions: s.paymentSubmissions.map((p) => (p.id === id ? { ...p, status } : p)),
            outstandingFees,
            fees,
            paymentHistory: [
              {
                id: Date.now(),
                name: target?.studentName
                  ? `UPI / UTR · ${target.studentName}`
                  : 'UPI / UTR settlement',
                amount,
                status: 'Paid' as const,
                date,
                receiptId,
              },
              ...s.paymentHistory,
            ],
            paymentReceipt: { id: receiptId, date, amount, ref: id },
          }
        })
        void markAllFeesPaid(studentId)
        get().pushNotification({
          role: 'parent',
          title: 'Fee payment verified',
          body: `UTR payment of ₹${amount.toLocaleString()} verified by school.`,
        })
        get().triggerToast('Payment verified · fees cleared.')
      },

      persistSchoolPaymentSettings: async () => {
        const settings = get().schoolPaymentSettings
        const result = await saveSchoolPaymentSettings(settings)
        if (!result.ok) {
          get().triggerToast(result.error ?? 'Could not save payment settings.')
          return
        }
        get().triggerToast('School UPI / bank details saved.')
      },

      submitLeave: (date, reason, teacherName) => {
        const name = teacherName?.trim() || 'Teacher'
        const entry: LeaveRequest = { id: Date.now(), date, reason, status: 'Reviewing', teacherName: name }
        set((s) => ({ leaves: [entry, ...s.leaves] }))
        void syncSubmitLeave({ date, reason }).then((remoteId) => {
          if (remoteId) {
            set((s) => ({
              leaves: s.leaves.map((l) => (l.id === entry.id ? { ...l, id: remoteId } : l)),
            }))
          }
        })
        get().pushNotification({
          role: 'school',
          title: 'Leave request',
          body: `${name} · ${date}: ${reason}`,
        })
        get().triggerToast('Leave submitted — awaiting school approval.')
      },

      setLeaveStatus: (id, status) => {
        const leave = get().leaves.find((l) => l.id === id)
        set((s) => ({ leaves: s.leaves.map((l) => (l.id === id ? { ...l, status } : l)) }))
        void syncSetLeaveStatus(id, status)
        if (!leave) return
        get().pushNotification({
          role: 'teacher',
          title: status === 'Approved' ? 'Leave approved' : 'Leave declined',
          body:
            status === 'Approved'
              ? `Your leave for ${leave.date} was approved. Substitute planning queued.`
              : `Your leave for ${leave.date} was declined. Contact admin if needed.`,
        })
        get().triggerToast(
          status === 'Approved' ? 'Leave approved · teacher notified.' : 'Leave declined · teacher notified.',
        )
      },

      toggleSyllabusSubtopic: (chapterId, subtopicId) => {
        set((s) => ({
          curriculum: s.curriculum.map((ch) => {
            if (ch.id !== chapterId) return ch
            return {
              ...ch,
              subtopics: ch.subtopics.map((st) => {
                if (st.id !== subtopicId) return st
                const done = !st.done
                return {
                  ...st,
                  done,
                  completedAt: done ? new Date().toISOString().slice(0, 10) : undefined,
                }
              }),
            }
          }),
        }))
        void saveSyllabusState(get().curriculum)
        const chapter = get().curriculum.find((c) => c.id === chapterId)
        const sub = chapter?.subtopics.find((st) => st.id === subtopicId)
        if (sub?.done) {
          get().triggerToast(`Marked done · ${sub.title}`)
          get().pushNotification({
            role: 'student',
            title: 'Syllabus update',
            body: `${chapter?.subject}: “${sub.title}” marked complete.`,
          })
        }
      },

      uploadSyllabusNote: async (chapterId, subtopicId, file) => {
        if (file.size > 2_500_000) {
          get().triggerToast('Note too large — keep under 2.5 MB.')
          return
        }

        let noteDataUrl = ''
        let storedRemotely = false
        const upload = await uploadSyllabusNoteFile(chapterId, subtopicId, file)
        if (upload.ok) {
          noteDataUrl = upload.publicUrl
          storedRemotely = true
        } else {
          noteDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result ?? ''))
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
          })
          get().triggerToast(upload.error || 'Stored note on this device only')
        }

        // Remove previous remote file if replacing
        const prev = get()
          .curriculum.find((c) => c.id === chapterId)
          ?.subtopics.find((st) => st.id === subtopicId)?.noteDataUrl
        if (storedRemotely && prev && prev !== noteDataUrl) {
          void deleteSyllabusNoteFile(prev)
        }

        set((s) => ({
          curriculum: s.curriculum.map((ch) => {
            if (ch.id !== chapterId) return ch
            return {
              ...ch,
              subtopics: ch.subtopics.map((st) =>
                st.id === subtopicId
                  ? {
                      ...st,
                      noteName: file.name,
                      noteDataUrl,
                      noteMime: file.type || 'application/octet-stream',
                      noteUploadedAt: new Date().toISOString().slice(0, 10),
                    }
                  : st,
              ),
            }
          }),
        }))
        void saveSyllabusState(get().curriculum)
        get().triggerToast(
          storedRemotely ? `Notes uploaded · ${file.name}` : `Notes saved locally · ${file.name}`,
        )
        const chapter = get().curriculum.find((c) => c.id === chapterId)
        const sub = chapter?.subtopics.find((st) => st.id === subtopicId)
        get().pushNotification({
          role: 'student',
          title: 'Teacher notes ready',
          body: `${chapter?.subject} · ${sub?.title}: new notes from your teacher.`,
        })
      },

      clearSyllabusNote: (chapterId, subtopicId) => {
        const prev = get()
          .curriculum.find((c) => c.id === chapterId)
          ?.subtopics.find((st) => st.id === subtopicId)?.noteDataUrl
        void deleteSyllabusNoteFile(prev)
        set((s) => ({
          curriculum: s.curriculum.map((ch) => {
            if (ch.id !== chapterId) return ch
            return {
              ...ch,
              subtopics: ch.subtopics.map((st) =>
                st.id === subtopicId
                  ? {
                      ...st,
                      noteName: undefined,
                      noteDataUrl: undefined,
                      noteMime: undefined,
                      noteUploadedAt: undefined,
                    }
                  : st,
              ),
            }
          }),
        }))
        void saveSyllabusState(get().curriculum)
        get().triggerToast('Notes removed.')
      },

      submitBroadcast: (title, target, content) => {
        const msg: BroadcastMessage = { id: Date.now(), title, target, content, date: 'Just Now' }
        set((s) => ({ broadcasts: [msg, ...s.broadcasts] }))
        void syncBroadcast(msg)
        const roleMap: Record<string, NotificationItem['role']> = {
          All: 'all',
          Parents: 'parent',
          Teachers: 'teacher',
          Students: 'student',
        }
        get().pushNotification({
          role: roleMap[target] ?? 'all',
          title,
          body: content,
        })
        get().triggerToast(`Circular published to ${target}.`)
      },

      addCalendarEvent: (title, category, date) => {
        const entry = { id: Date.now(), title, category, date }
        set((s) => ({
          calendarEvents: [entry, ...s.calendarEvents],
        }))
        void syncCalendarEvent(entry)
        if (category === 'PTA Meetings' || category === 'Holidays') {
          get().submitBroadcast(title, 'All', `${category} scheduled for ${date}.`)
        } else {
          get().triggerToast('Event added to school calendar.')
        }
      },

      scheduleInterview: (id) => {
        set((s) => ({
          candidates: s.candidates.map((c) => (c.id === id ? { ...c, status: 'Interview Scheduled' } : c)),
        }))
        const c = get().candidates.find((x) => x.id === id)
        get().triggerToast(`Interview scheduled with ${c?.name ?? 'candidate'}.`)
      },

      tickBus: () => {
        const wasAtSchool = get().busReachedSchool
        set((s) => {
          const next = s.busPosition + 1.2
          const wrapped = next >= 96 ? 12 : next
          const busReachedSchool = wrapped >= 88
          const fleet = s.fleet.map((b) =>
            b.active ? { ...b, position: b.id === 'bus_14' ? wrapped : (b.position + 0.8) % 95 } : b,
          )
          return { busPosition: wrapped, busReachedSchool, fleet }
        })
        if (!wasAtSchool && get().busReachedSchool) {
          get().pushNotification({
            role: 'parent',
            title: 'Bus arrived at school',
            body: `Bus 14 reached campus. ${childFirstName(get().linkedStudent)} is safe at school.`,
          })
        }
      },

      resetDemoData: () => {
        set({
          attendanceRecords: initialAttendance,
          tasks: initialTasks,
          studentGrades: initialGrades,
          roster: initialRoster,
          unlockedBadges: ['Streak Keeper', 'Early Bird', 'Curious Mind'],
          totalXp: 430,
          fees: initialFees,
          paymentHistory: initialPaymentHistory,
          outstandingFees: 42500,
          paymentReceipt: null,
          paymentProcessing: false,
          paymentMethod: 'upi',
          upiId: '',
          paymentSubmissions: [],
          schoolPaymentSettings: {
            upiId: 'sunrise.school@oksbi',
            accountName: 'Sunrise Public School',
            bankName: 'Demo Bank',
            ifsc: '',
            instructions: 'Pay the exact outstanding amount via UPI, then submit the UTR here. ₹0 gateway fee.',
          },
          broadcasts: initialBroadcasts,
          calendarEvents: initialCalendar,
          leaves: initialLeaves,
          curriculum: initialCurriculum,
          timetableByDay: getLocalTimetable(),
          candidates: initialCandidates,
          fleet: initialFleet,
          notifications: initialNotifications,
          busPosition: 40,
          busReachedSchool: false,
          studyScore: computeStudyScore(attendancePercent(initialAttendance), homeworkPercent(initialTasks)),
          aiResponse: '',
          quizMode: false,
          activeQuiz: null,
          quizScore: null,
          scanStep: 'select',
          scanInsight: null,
          scanPreviewUrl: null,
          scanError: null,
          remediationMarkdown: '',
          validationSubmitted: false,
          selectedValidationAnswer: null,
        })
        get().triggerToast('Demo data reset to starting state.')
      },

      setAiPrompt: (aiPrompt) => set({ aiPrompt }),
      setAiLoading: (aiLoading) => set({ aiLoading }),
      setAiResult: (aiResponse, aiSource) => set({ aiResponse, aiSource, aiLoading: false, quizMode: false }),
      setQuiz: (activeQuiz, aiSource) =>
        set({
          activeQuiz,
          quizMode: !!activeQuiz,
          selectedAnswers: {},
          quizScore: null,
          aiLoading: false,
          aiResponse: '',
          aiSource: aiSource ?? null,
        }),
      setSelectedAnswer: (qIdx, optIdx) =>
        set((s) => ({ selectedAnswers: { ...s.selectedAnswers, [qIdx]: optIdx } })),
      submitQuiz: () => {
        const { activeQuiz, selectedAnswers } = get()
        if (!activeQuiz) return
        let correct = 0
        activeQuiz.questions.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.answerIndex) correct += 1
        })
        set({ quizScore: correct })
        if (correct === activeQuiz.questions.length) {
          get().addXp(100)
          get().unlockBadge('Quiz Whiz')
          get().triggerToast('Perfect quiz! +100 XP · Quiz Whiz unlocked.')
        }
      },
      setListening: (isListening) => set({ isListening }),
      setSpeaking: (isSpeaking) => set({ isSpeaking }),
      clearAiPanel: () => set({ aiResponse: '', quizMode: false, activeQuiz: null, quizScore: null, aiSource: null }),

      startScan: (target) => {
        const insight = getDemoInsight(target)
        set({
          scanTarget: target,
          scanStep: 'scanning',
          selectedValidationAnswer: null,
          validationSubmitted: false,
          remediationMarkdown: '',
          scanInsight: null,
          scanPreviewUrl: null,
          scanError: null,
        })
        window.setTimeout(() => {
          set({
            scanStep: 'evaluated',
            scanInsight: insight,
            scanConfidence: insight.confidence,
            scanModel: insight.model || 'Offline coach',
          })
        }, 900)
      },

      evaluatePaperScan: async (target, file) => {
        const previousPreview = get().scanPreviewUrl
        if (previousPreview) URL.revokeObjectURL(previousPreview)

        set({
          scanTarget: target,
          scanStep: 'scanning',
          selectedValidationAnswer: null,
          validationSubmitted: false,
          remediationMarkdown: '',
          remediationSource: null,
          scanInsight: null,
          scanError: null,
          scanPreviewUrl: null,
        })

        try {
          const payload = await fileToVisionPayload(file)
          set({ scanPreviewUrl: payload.previewUrl })
          const insight = await evaluatePaperCoach(target, payload.base64, payload.mimeType)
          set({
            scanStep: 'evaluated',
            scanInsight: insight,
            scanConfidence: insight.confidence,
            scanModel: insight.model || (insight.source === 'live' ? 'Gemini vision' : 'Offline coach'),
            scanError: insight.source === 'offline' ? 'Live vision unavailable — showing coach fallback.' : null,
          })
          get().triggerToast(
            insight.source === 'live'
              ? 'Paper evaluated with AI vision coach.'
              : 'Vision offline — demo coach insights shown.',
          )
        } catch (err) {
          const insight = getDemoInsight(target)
          set({
            scanStep: 'evaluated',
            scanInsight: insight,
            scanConfidence: insight.confidence,
            scanModel: insight.model || 'Offline coach',
            scanError: err instanceof Error ? err.message : 'Could not read that photo.',
          })
          get().triggerToast('Could not process photo — showing fallback coach tips.')
        }
      },

      finishScanEvaluation: () => {
        const insight = get().scanInsight ?? getDemoInsight(get().scanTarget)
        set({
          scanStep: 'evaluated',
          scanInsight: insight,
          scanConfidence: insight.confidence,
          scanModel: insight.model || 'Coach',
        })
      },

      setRemediation: (remediationMarkdown, remediationSource) =>
        set({ remediationMarkdown, remediationSource, remediationLoading: false, scanStep: 'analogy' }),
      setRemediationLoading: (remediationLoading) => set({ remediationLoading, scanStep: 'analogy' }),
      setScanStep: (scanStep) => set({ scanStep }),
      setValidationAnswer: (selectedValidationAnswer) => set({ selectedValidationAnswer }),

      submitValidation: () => {
        const { scanTarget, selectedValidationAnswer, scanInsight } = get()
        const insight = scanInsight ?? getDemoInsight(scanTarget)
        if (selectedValidationAnswer === null) return
        set({ validationSubmitted: true })
        if (selectedValidationAnswer !== insight.checkAnswerIndex) {
          get().triggerToast('Not quite — review the analogy and try again.')
          set({ validationSubmitted: false })
          return
        }
        const gradeField =
          scanTarget === 'chemistry' ? 'chem' : scanTarget === 'science' || scanTarget === 'physics' ? 'science' : 'math'
        set((s) => ({
          scanStep: 'validated',
          studentGrades: s.studentGrades.map((g) =>
            g.id === 'g1' || g.id === s.studentGrades[0]?.id
              ? {
                  ...g,
                  ...(scanTarget === 'english'
                    ? {}
                    : { [gradeField]: '48/50' }),
                  comment: `Growth after paper coach (${insight.subject}): ${insight.flaggedWeakness}`,
                }
              : g,
          ),
        }))
        get().addXp(100)
        get().unlockBadge('Concept Master')
        get().unlockBadge('Rising Scholar')
        get().pushNotification({
          role: 'student',
          title: 'Concept practiced',
          body: insight.flaggedWeakness,
        })
        get().pushNotification({
          role: 'parent',
          title: 'Paper coach update',
          body: `${childFirstName(get().linkedStudent)} practiced ${insight.subject}: ${insight.flaggedWeakness}`,
        })
        get().triggerToast('Check passed · Concept Master unlocked.')
      },

      resetScanner: () => {
        const preview = get().scanPreviewUrl
        if (preview) URL.revokeObjectURL(preview)
        set({
          scanStep: 'select',
          validationSubmitted: false,
          selectedValidationAnswer: null,
          remediationMarkdown: '',
          remediationSource: null,
          scanInsight: null,
          scanPreviewUrl: null,
          scanError: null,
        })
      },

      setGanttDay: (selectedGanttDay) => set({ selectedGanttDay }),

      saveTimetable: async (className, week) => {
        const result = await saveTimetableWeek(className, week)
        if (!result.ok) {
          get().triggerToast(result.error ?? 'Could not save timetable.')
          return false
        }
        const refreshed = await fetchTimetableByDay(className)
        set({ timetableByDay: refreshed })
        get().pushNotification({
          role: 'student',
          title: 'Timetable updated',
          body: `${className} schedule was updated by school.`,
        })
        get().pushNotification({
          role: 'teacher',
          title: 'Timetable updated',
          body: `${className} periods were saved by school admin.`,
        })
        get().triggerToast('Timetable saved for class.')
        return true
      },

      setLifecycleSubject: (selectedLifecycleSubject) => set({ selectedLifecycleSubject }),
      setLifecycleMetric: (selectedLifecycleMetric) => set({ selectedLifecycleMetric }),

      unlockBadge: (name) => {
        if (!ALL_BADGES.some((b) => b.name === name)) return
        set((s) =>
          s.unlockedBadges.includes(name) ? s : { unlockedBadges: [...s.unlockedBadges, name] },
        )
      },
      addXp: (amount) => set((s) => ({ totalXp: s.totalXp + amount })),
    }),
    {
      name: 'orbit-school-v1',
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        attendanceRecords: s.attendanceRecords,
        tasks: s.tasks,
        studentGrades: s.studentGrades,
        roster: s.roster,
        unlockedBadges: s.unlockedBadges,
        totalXp: s.totalXp,
        fees: s.fees,
        paymentHistory: s.paymentHistory,
        outstandingFees: s.outstandingFees,
        paymentReceipt: s.paymentReceipt,
        schoolPaymentSettings: s.schoolPaymentSettings,
        paymentSubmissions: s.paymentSubmissions,
        broadcasts: s.broadcasts,
        calendarEvents: s.calendarEvents,
        leaves: s.leaves,
        curriculum: s.curriculum,
        candidates: s.candidates,
        notifications: s.notifications,
        studyScore: s.studyScore,
      }),
    },
  ),
)
