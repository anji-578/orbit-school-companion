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
  schoolTeachers,
} from '../data/demo'
import { computeStudyScore } from '../lib/studyScore'
import { dispatchRemoteAlert, eventTypeFromNotification } from '../lib/alerts'
import { resolveClassLinked } from '../lib/classLink'
import {
  childFirstName,
  fetchLinkedStudent,
  fetchLinkedStudents,
  pickActiveStudent,
  setActiveStudentIdPreference,
  type LinkedStudent,
} from '../lib/linkedStudent'
import {
  busRowsToFleet,
  fetchBusRoutes,
  fetchHiringApplications,
  scheduleHiringInterview,
} from '../lib/opsSurfacesApi'
import { currentDayCode, fetchTimetableByDay, getLocalTimetable, saveTimetableWeek, type TimetableByDay } from '../lib/timetableApi'
import { withSample, timetableHasSlots } from '../lib/sampleData'
import { fetchStaffDirectory } from '../lib/staffApi'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import { loadSchoolOpsSnapshot } from '../lib/schoolOpsApi'
import {
  claimDemoLinks,
  fetchAttendanceHistory,
  fetchRosterWithTodayAttendance,
} from '../lib/attendanceApi'
import { startAttendanceQueueSync } from '../lib/attendanceQueue'
import { fetchSchoolPolicy, resolveClassLabel } from '../lib/schoolPolicy'
import { fetchStudentGrades, saveStudentGrades } from '../lib/gradesApi'
import { deleteSyllabusNoteFile, fetchSyllabusState, mergeCurriculum, saveSyllabusState, uploadSyllabusNoteFile } from '../lib/syllabusApi'
import { withSyllabusLearningLinks } from '../lib/syllabusLinks'
import { friendlyError } from '../lib/errors'
import { attendancePercent, homeworkPercent } from './orbitHelpers'
import { createAttendanceActions } from './attendanceActions'
import { createPaymentActions } from './paymentActions'
import { createSchoolOpsActions } from './schoolOpsActions'

export { chapterProgress, curriculumProgress } from './orbitHelpers'
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
  TeacherProfile,
  ThemeMode,
} from '../types'

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
  feesHasMore: boolean
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
  teachers: TeacherProfile[]
  candidates: Candidate[]
  fleet: FleetBus[]
  notifications: NotificationItem[]
  /** True when at least one list is showing local/sample fill for demos. */
  showingSampleData: boolean
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
  /** All linked children (parent multi-child). */
  linkedStudents: LinkedStudent[]
  /** True when Supabase is configured — empty remote arrays must not fall back to demo seed. */
  usingCloudData: boolean
  getAttendancePercent: () => number
  setActiveChild: (studentId: string) => Promise<void>

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

  toggleRosterPresent: (id: string) => void
  markAllRosterPresent: () => void
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
  loadMoreFees: () => Promise<void>
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
  updateSyllabusLinks: (
    chapterId: string,
    subtopicId: string,
    links: { youtubeUrl?: string; revisionNotesUrl?: string },
  ) => void
  submitBroadcast: (title: string, target: string, content: string) => void
  addCalendarEvent: (title: string, category: CalendarEvent['category'], date: string) => void
  scheduleInterview: (id: string | number) => void

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
      feesHasMore: false,
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
      curriculum: withSyllabusLearningLinks(initialCurriculum),
      timetableByDay: getLocalTimetable(),
      teachers: schoolTeachers,
      candidates: initialCandidates,
      fleet: initialFleet,
      notifications: initialNotifications,
      showingSampleData: true,

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
      linkedStudents: [],
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
            {
              id: localId,
              time: 'Just now',
              unread: n.unread ?? true,
              role: n.role,
              title: n.title,
              body: n.body,
              studentId: n.studentId,
            },
            ...s.notifications,
          ],
        }))
        const eventType = eventTypeFromNotification(n.title, n.body)
        void insertAppNotification({
          title: n.title,
          body: n.body,
          role: n.role,
          eventType,
          studentId: n.studentId,
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
          studentId: n.studentId,
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

      ...createAttendanceActions(set, get),
      ...createSchoolOpsActions(set, get),

      updateGrade: (id, patch) =>
        set((s) => ({
          studentGrades: s.studentGrades.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      saveGrades: () => {
        const grades = get().studentGrades
        void saveStudentGrades(grades).then((result) => {
          if (!result.ok) {
            get().triggerToast(friendlyError(result.error ?? 'Could not save marks to cloud.'))
            return
          }
          const childId = get().linkedStudent?.id
          get().pushNotification({
            role: 'student',
            title: 'Marks updated',
            body: 'Your teacher saved new midterm scores and diagnostic notes.',
            studentId: childId,
          })
          get().pushNotification({
            role: 'parent',
            title: 'Report card updated',
            body: `${childFirstName(get().linkedStudent)}'s marks and teacher comments were updated.`,
            studentId: childId,
          })
          get().triggerToast('Marks saved and synced to Student + Parent portals.')
        })
      },

      ...createPaymentActions(set, get),

      setActiveChild: async (studentId) => {
        const match = get().linkedStudents.find((s) => s.id === studentId)
        if (!match) return
        setActiveStudentIdPreference(studentId)
        set({ linkedStudent: match })
        const [ops, attendanceRecords, studentGrades] = await Promise.all([
          loadSchoolOpsSnapshot(studentId),
          fetchAttendanceHistory(20, studentId),
          fetchStudentGrades(studentId),
          get().loadPaymentWorkspace(),
        ])
        const tasks = withSample(ops.tasks, [])
        const nextAttendance = withSample(attendanceRecords, [])
        const nextGrades = withSample(studentGrades, [])
        set({
          linkedStudent: match,
          tasks,
          attendanceRecords: nextAttendance,
          studentGrades: nextGrades,
          studyScore: computeStudyScore(attendancePercent(nextAttendance), homeworkPercent(tasks)),
        })
        const first = match.displayName.split(/\s+/).filter(Boolean)[0] || match.displayName
        get().triggerToast(`Viewing ${first}'s data`)
      },

      hydrateFromSupabase: async () => {
        const cloud = isSupabaseConfigured()
        await claimDemoLinks()
        await fetchSchoolPolicy()
        const sessionEmail = (await getSupabase()?.auth.getUser())?.data.user?.email ?? ''
        const role = get().role
        const classLinked = await resolveClassLinked(sessionEmail, role)
        const linkedStudents = await fetchLinkedStudents(sessionEmail, role)
        const linkedStudent =
          pickActiveStudent(linkedStudents) ?? (await fetchLinkedStudent(sessionEmail, role))
        const timetableClass = resolveClassLabel({
          linkedClassName: linkedStudent?.className,
          linkedSection: linkedStudent?.section,
        })
        const [ops, roster, attendanceRecords, studentGrades, remoteSyllabus, timetableByDay, teachers, busRoutes, hiring] =
          await Promise.all([
            loadSchoolOpsSnapshot(linkedStudent?.id),
            fetchRosterWithTodayAttendance({
              activeClassOnly: role === 'teacher',
              includeInactive: role === 'school',
            }),
            fetchAttendanceHistory(20, linkedStudent?.id),
            fetchStudentGrades(linkedStudent?.id),
            fetchSyllabusState(),
            fetchTimetableByDay(timetableClass),
            fetchStaffDirectory(),
            fetchBusRoutes(),
            fetchHiringApplications(),
            get().loadPaymentWorkspace(),
          ])
        startAttendanceQueueSync((result) => {
          if (result.flushed > 0) {
            get().triggerToast(`Synced ${result.flushed} offline attendance mark(s).`)
            void get().hydrateFromSupabase()
          }
        })
        await get().refreshNotifications()
        set((s) => {
          const tasks = withSample(ops.tasks, initialTasks)
          const leaves = withSample(ops.leaves, initialLeaves)
          const broadcasts = withSample(ops.broadcasts, initialBroadcasts)
          const calendarEvents = withSample(ops.calendarEvents, initialCalendar)
          const nextRoster = withSample(roster, initialRoster)
          const nextAttendance = withSample(attendanceRecords, initialAttendance)
          const nextGrades = withSample(studentGrades, initialGrades)
          const nextTeachers = withSample(teachers, schoolTeachers)
          const nextTimetable = timetableHasSlots(timetableByDay)
            ? timetableByDay
            : cloud
              ? timetableByDay
              : getLocalTimetable()
          const curriculum = withSyllabusLearningLinks(
            mergeCurriculum(
              remoteSyllabus,
              cloud ? s.curriculum : s.curriculum.length ? s.curriculum : initialCurriculum,
            ),
          )

          const usedSample = !cloud && (
            !(ops.tasks?.length) ||
            !(ops.leaves?.length) ||
            !(ops.broadcasts?.length) ||
            !(ops.calendarEvents?.length) ||
            !roster.length ||
            !attendanceRecords.length ||
            !studentGrades.length ||
            !teachers.length ||
            !timetableHasSlots(timetableByDay)
          )

          const nextFleet = busRoutes.length
            ? busRowsToFleet(busRoutes)
            : withSample([], initialFleet)
          const nextCandidates = hiring.length ? hiring : withSample([], initialCandidates)
          const primaryBus = busRoutes.find((b) => b.id === 'bus_14') || busRoutes[0]
          return {
            usingCloudData: cloud,
            showingSampleData: usedSample,
            classLinked,
            linkedStudent,
            linkedStudents,
            tasks,
            leaves,
            broadcasts,
            calendarEvents,
            roster: nextRoster,
            attendanceRecords: nextAttendance,
            studentGrades: nextGrades,
            teachers: nextTeachers,
            curriculum,
            timetableByDay: nextTimetable ?? s.timetableByDay,
            fleet: nextFleet.length ? nextFleet : cloud ? [] : s.fleet,
            candidates: nextCandidates.length ? nextCandidates : cloud ? [] : s.candidates,
            busReachedSchool: primaryBus?.status === 'at_school' ? true : s.busReachedSchool,
            busPosition: primaryBus
              ? primaryBus.status === 'at_school'
                ? 92
                : primaryBus.status === 'en_route'
                  ? 55
                  : 12
              : s.busPosition,
            studyScore: computeStudyScore(attendancePercent(nextAttendance), homeworkPercent(tasks)),
          }
        })
      },

      toggleSyllabusSubtopic: (chapterId, subtopicId) => {
        const prev = get().curriculum
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
        void saveSyllabusState(get().curriculum).then((result) => {
          if (!result.ok) {
            set({ curriculum: prev })
            get().triggerToast(friendlyError(result.error ?? 'Could not save syllabus.'))
            return
          }
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
        })
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

      updateSyllabusLinks: (chapterId, subtopicId, links) => {
        const prev = get().curriculum
        set((s) => ({
          curriculum: s.curriculum.map((ch) => {
            if (ch.id !== chapterId) return ch
            return {
              ...ch,
              subtopics: ch.subtopics.map((st) => {
                if (st.id !== subtopicId) return st
                return {
                  ...st,
                  youtubeUrl: links.youtubeUrl?.trim() || undefined,
                  revisionNotesUrl: links.revisionNotesUrl?.trim() || st.revisionNotesUrl,
                  revisionNotesName: links.revisionNotesUrl?.trim()
                    ? st.revisionNotesName || `${st.title}-revision`
                    : st.revisionNotesName,
                }
              }),
            }
          }),
        }))
        void saveSyllabusState(get().curriculum).then((result) => {
          if (!result.ok) {
            set({ curriculum: prev })
            get().triggerToast(friendlyError(result.error ?? 'Could not save links.'))
            return
          }
          get().triggerToast('Topic links saved.')
        })
      },

      scheduleInterview: (id) => {
        const prev = get().candidates.find((c) => c.id === id)?.status
        set((s) => ({
          candidates: s.candidates.map((c) => (c.id === id ? { ...c, status: 'Interview Scheduled' } : c)),
        }))
        const c = get().candidates.find((x) => x.id === id)
        if (typeof id === 'string' && id.includes('-')) {
          void scheduleHiringInterview(id).then((result) => {
            if (!result.ok) {
              if (prev) {
                set((s) => ({
                  candidates: s.candidates.map((row) => (row.id === id ? { ...row, status: prev } : row)),
                }))
              }
              get().triggerToast(result.error ?? 'Could not schedule interview.')
              return
            }
            get().triggerToast(`Interview scheduled with ${c?.name ?? 'candidate'}.`)
          })
          return
        }
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
          feesHasMore: false,
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
          curriculum: withSyllabusLearningLinks(initialCurriculum),
          timetableByDay: getLocalTimetable(),
          teachers: schoolTeachers,
          candidates: initialCandidates,
          fleet: initialFleet,
          notifications: initialNotifications,
          showingSampleData: true,
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
        // Practice only — never write official report-card grades from AI
        set({ scanStep: 'validated' })
        get().addXp(100)
        get().unlockBadge('Concept Master')
        get().unlockBadge('Rising Scholar')
        get().pushNotification({
          role: 'student',
          title: 'Concept practiced',
          body: `${insight.flaggedWeakness} (practice — not an official mark)`,
        })
        get().pushNotification({
          role: 'parent',
          title: 'Paper coach practice',
          body: `${childFirstName(get().linkedStudent)} practiced ${insight.subject}. Official marks stay with the teacher.`,
        })
        get().triggerToast('Practice check passed · XP earned (report card unchanged).')
        void scanTarget
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
