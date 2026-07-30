import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ALL_BADGES,
  initialAttendance,
  initialBroadcasts,
  initialCalendar,
  initialCandidates,
  initialFees,
  initialFleet,
  initialGrades,
  initialLeaves,
  initialNotifications,
  initialPaymentHistory,
  initialRoster,
  initialTasks,
  remediationTemplates,
} from '../data/demo'
import { computeStudyScore } from '../lib/studyScore'
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
  PaymentMethod,
  PaymentReceipt,
  PaymentRecord,
  QuizPayload,
  Role,
  RosterStudent,
  ScanStep,
  ScanTarget,
  StudentGrade,
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

interface OrbitState {
  role: Role
  lang: Lang
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

  broadcasts: BroadcastMessage[]
  calendarEvents: CalendarEvent[]
  leaves: LeaveRequest[]
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
  remediationMarkdown: string
  remediationLoading: boolean
  remediationSource: 'live' | 'offline' | null
  selectedValidationAnswer: number | null
  validationSubmitted: boolean

  selectedGanttDay: string
  selectedLifecycleSubject: string
  selectedLifecycleMetric: 'marks' | 'ranks'

  studyScore: number
  getAttendancePercent: () => number

  setRole: (role: Role) => void
  setLang: (lang: Lang) => void
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
  updateGrade: (id: string, patch: Partial<StudentGrade>) => void
  saveGrades: () => void

  setPaymentMethod: (m: PaymentMethod) => void
  setUpiId: (v: string) => void
  executePayment: () => void
  nudgeFeeParents: () => void

  submitLeave: (date: string, reason: string) => void
  setLeaveStatus: (id: number, status: LeaveStatus) => void
  submitBroadcast: (title: string, target: string, content: string) => void
  addCalendarEvent: (title: string, category: CalendarEvent['category'], date: string) => void
  scheduleInterview: (id: number) => void

  tickBus: () => void

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
  finishScanEvaluation: () => void
  setRemediation: (md: string, source: 'live' | 'offline') => void
  setRemediationLoading: (v: boolean) => void
  setScanStep: (step: ScanStep) => void
  setValidationAnswer: (idx: number | null) => void
  submitValidation: () => void
  resetScanner: () => void

  setGanttDay: (day: string) => void
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

      broadcasts: initialBroadcasts,
      calendarEvents: initialCalendar,
      leaves: initialLeaves,
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
      scanModel: 'Gemini Flash (demo)',
      scanConfidence: 82,
      remediationMarkdown: '',
      remediationLoading: false,
      remediationSource: null,
      selectedValidationAnswer: null,
      validationSubmitted: false,

      selectedGanttDay: 'MON',
      selectedLifecycleSubject: 'chemLabSubject',
      selectedLifecycleMetric: 'marks',

      studyScore: computeStudyScore(attendancePercent(initialAttendance), homeworkPercent(initialTasks)),

      getAttendancePercent: () => attendancePercent(get().attendanceRecords),

      setRole: (role) => set({ role, activeTab: 'dashboard', mobileMenuOpen: false, notifOpen: false }),
      setLang: (lang) => set({ lang }),
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

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { id: Date.now(), time: 'Just now', unread: n.unread ?? true, role: n.role, title: n.title, body: n.body },
            ...s.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, unread: false })) })),

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

        // Real cross-node sync for demo student Ananya
        if (student.isDemo) {
          const today = state.attendanceRecords[state.attendanceRecords.length - 1]
          if (today) {
            const attendanceRecords = state.attendanceRecords.map((rec, idx, arr) => {
              if (idx !== arr.length - 1) return rec
              return {
                ...rec,
                status: (nextPresent ? 'Present' : 'Absent') as AttendanceRecord['status'],
                reason: nextPresent ? undefined : 'Marked absent by class teacher',
              }
            })
            const studyScore = computeStudyScore(attendancePercent(attendanceRecords), homeworkPercent(state.tasks))
            set({ attendanceRecords, studyScore })
          }
          get().pushNotification({
            role: 'parent',
            title: nextPresent ? 'Attendance: Present' : 'Attendance Alert',
            body: `Ananya Rao marked ${nextPresent ? 'Present' : 'Absent'} in Class 11-A.`,
          })
          get().pushNotification({
            role: 'student',
            title: 'Attendance updated',
            body: `Your status is now ${nextPresent ? 'Present' : 'Absent'} for today.`,
          })
          get().triggerToast(
            `Synced: Ananya marked ${nextPresent ? 'Present' : 'Absent'} across Student + Parent nodes.`,
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
        get().triggerToast(`Absentee alerts sent for: ${absentees.map((a) => a.name).join(', ')}`)
      },

      toggleTask: (id) => {
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
      },

      updateGrade: (id, patch) =>
        set((s) => ({
          studentGrades: s.studentGrades.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      saveGrades: () => {
        get().pushNotification({
          role: 'student',
          title: 'Marks updated',
          body: 'Your teacher saved new midterm scores and diagnostic notes.',
        })
        get().pushNotification({
          role: 'parent',
          title: 'Report card updated',
          body: "Ananya's marks and teacher comments were updated.",
        })
        get().triggerToast('Marks saved and synced to Student + Parent portals.')
      },

      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setUpiId: (upiId) => set({ upiId }),

      executePayment: () => {
        const { outstandingFees, upiId, paymentMethod } = get()
        if (outstandingFees <= 0) {
          get().triggerToast('No outstanding balance.')
          return
        }
        if (paymentMethod === 'upi' && upiId.trim().length < 3) {
          get().triggerToast('Enter a UPI ID to continue (demo).')
          return
        }
        set({ paymentProcessing: true })
        setTimeout(() => {
          const receiptId = `REC-${Math.floor(10000 + Math.random() * 90000)}`
          const ref = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`
          const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: '2-digit' })
          set((s) => ({
            paymentProcessing: false,
            outstandingFees: 0,
            fees: s.fees.map((f) => ({ ...f, status: 'Paid' as const })),
            paymentHistory: [
              {
                id: Date.now(),
                name: 'Comprehensive Tuition & Lab Settlement',
                amount: outstandingFees,
                status: 'Paid',
                date,
                receiptId,
              },
              ...s.paymentHistory,
            ],
            paymentReceipt: { id: receiptId, date, amount: outstandingFees, ref },
          }))
          get().pushNotification({
            role: 'parent',
            title: 'Fee payment cleared',
            body: `Demo receipt ${receiptId} · ₹${outstandingFees.toLocaleString()} settled.`,
          })
          get().pushNotification({
            role: 'school',
            title: 'Fee collected',
            body: `Ananya Rao account cleared · ${receiptId}`,
          })
          get().triggerToast('Demo payment complete. Receipt generated (simulation only).')
        }, 1600)
      },

      nudgeFeeParents: () => {
        get().pushNotification({
          role: 'parent',
          title: 'Fee reminder',
          body: 'School accounts nudged families with pending dues.',
        })
        get().triggerToast('Fee reminder notifications queued for pending accounts.')
      },

      submitLeave: (date, reason) => {
        const entry: LeaveRequest = { id: Date.now(), date, reason, status: 'Reviewing' }
        set((s) => ({ leaves: [entry, ...s.leaves] }))
        get().pushNotification({
          role: 'school',
          title: 'Leave request',
          body: `Teacher leave for ${date}: ${reason}`,
        })
        get().triggerToast('Leave submitted — status: Reviewing. Proxy planning queued.')
        setTimeout(() => {
          set((s) => ({
            leaves: s.leaves.map((l) => (l.id === entry.id ? { ...l, status: 'Approved' as const } : l)),
          }))
          get().triggerToast('Leave approved. Substitute teacher assigned (demo).')
        }, 2500)
      },

      setLeaveStatus: (id, status) =>
        set((s) => ({ leaves: s.leaves.map((l) => (l.id === id ? { ...l, status } : l)) })),

      submitBroadcast: (title, target, content) => {
        const msg: BroadcastMessage = { id: Date.now(), title, target, content, date: 'Just Now' }
        set((s) => ({ broadcasts: [msg, ...s.broadcasts] }))
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
        set((s) => ({
          calendarEvents: [{ id: Date.now(), title, category, date }, ...s.calendarEvents],
        }))
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

      tickBus: () =>
        set((s) => {
          const next = s.busPosition + 1.2
          const wrapped = next >= 96 ? 12 : next
          const busReachedSchool = wrapped >= 88
          const fleet = s.fleet.map((b) =>
            b.active ? { ...b, position: b.id === 'bus_14' ? wrapped : (b.position + 0.8) % 95 } : b,
          )
          return { busPosition: wrapped, busReachedSchool, fleet }
        }),

      setAiPrompt: (aiPrompt) => set({ aiPrompt }),
      setAiLoading: (aiLoading) => set({ aiLoading }),
      setAiResult: (aiResponse, aiSource) => set({ aiResponse, aiSource, aiLoading: false, quizMode: false }),
      setQuiz: (activeQuiz) =>
        set({
          activeQuiz,
          quizMode: !!activeQuiz,
          selectedAnswers: {},
          quizScore: null,
          aiLoading: false,
          aiResponse: '',
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
        set({
          scanTarget: target,
          scanStep: 'scanning',
          selectedValidationAnswer: null,
          validationSubmitted: false,
          remediationMarkdown: '',
        })
        setTimeout(() => get().finishScanEvaluation(), 2200)
      },

      finishScanEvaluation: () => {
        const tpl = remediationTemplates[get().scanTarget]
        set({
          scanStep: 'evaluated',
          scanConfidence: tpl.confidence,
          scanModel: tpl.modelEscalation,
        })
      },

      setRemediation: (remediationMarkdown, remediationSource) =>
        set({ remediationMarkdown, remediationSource, remediationLoading: false, scanStep: 'analogy' }),
      setRemediationLoading: (remediationLoading) => set({ remediationLoading, scanStep: 'analogy' }),
      setScanStep: (scanStep) => set({ scanStep }),
      setValidationAnswer: (selectedValidationAnswer) => set({ selectedValidationAnswer }),

      submitValidation: () => {
        const { scanTarget, selectedValidationAnswer } = get()
        const tpl = remediationTemplates[scanTarget]
        if (selectedValidationAnswer === null) return
        set({ validationSubmitted: true })
        if (selectedValidationAnswer !== tpl.correctIndex) {
          get().triggerToast('Not quite — review the analogy and try again.')
          set({ validationSubmitted: false })
          return
        }
        const chemOrMath = scanTarget === 'chemistry' ? 'chem' : 'math'
        set((s) => ({
          scanStep: 'validated',
          studentGrades: s.studentGrades.map((g) =>
            g.id === 'g1'
              ? {
                  ...g,
                  [chemOrMath]: '48/50',
                  comment:
                    scanTarget === 'chemistry'
                      ? 'Outstanding growth! Chemical coefficients gap resolved via remediation.'
                      : 'Sign-shift errors corrected after seesaw analogy practice.',
                }
              : g,
          ),
        }))
        get().addXp(100)
        get().unlockBadge('Concept Master')
        get().unlockBadge('Rising Scholar')
        get().pushNotification({
          role: 'student',
          title: 'Concept mastered',
          body: tpl.successToast,
        })
        get().pushNotification({
          role: 'parent',
          title: 'Score improved',
          body: `Ananya improved ${scanTarget} after AI remediation (48/50).`,
        })
        get().triggerToast(tpl.successToast)
      },

      resetScanner: () =>
        set({
          scanStep: 'select',
          validationSubmitted: false,
          selectedValidationAnswer: null,
          remediationMarkdown: '',
          remediationSource: null,
        }),

      setGanttDay: (selectedGanttDay) => set({ selectedGanttDay }),
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
        broadcasts: s.broadcasts,
        calendarEvents: s.calendarEvents,
        leaves: s.leaves,
        candidates: s.candidates,
        notifications: s.notifications,
        studyScore: s.studyScore,
      }),
    },
  ),
)
