import { computeStudyScore } from '../lib/studyScore'
import { childFirstName } from '../lib/linkedStudent'
import { resolveClassLabel } from '../lib/schoolPolicy'
import {
  syncAssignHomework,
  syncBroadcast,
  syncCalendarEvent,
  syncSetLeaveStatus,
  syncSubmitLeave,
  syncToggleHomework,
} from '../lib/schoolOpsApi'
import { friendlyError } from '../lib/errors'
import type { BroadcastMessage, CalendarEvent, HomeworkTask, LeaveRequest, LeaveStatus, NotificationItem } from '../types'
import { attendancePercent, homeworkPercent } from './orbitHelpers'
import { homeworkEventType } from '@/domain/xp/rules'
import { demoLocalAward, recordAndAwardXp } from '@/services/xp/award'
import { demoFixturesEnabled } from '@/shared/config/env'

async function awardAfterHomework(get: () => {
  linkedStudent: { id: string } | null
  totalXp: number
  unlockedBadges: string[]
  tasks: HomeworkTask[]
  setGamificationProjection: (xp: number, badges: string[]) => void
  triggerToast: (m: string) => void
}, task: HomeworkTask, allDone: boolean) {
  const studentId = get().linkedStudent?.id
  const eventType = homeworkEventType(task.difficulty)
  const apply = async (type: Parameters<typeof recordAndAwardXp>[0]['eventType'], ref?: string) => {
    if (studentId) {
      const snap = await recordAndAwardXp({ studentId, eventType: type, refId: ref })
      if (snap) {
        get().setGamificationProjection(snap.totalXp, snap.unlockedBadges)
        return
      }
    }
    if (demoFixturesEnabled()) {
      const next = demoLocalAward(
        { totalXp: get().totalXp, unlockedBadges: get().unlockedBadges },
        type,
      )
      get().setGamificationProjection(next.totalXp, next.unlockedBadges)
    }
  }
  await apply(eventType, String(task.id))
  if (allDone) {
    await apply('homework_all_done', 'all')
    get().triggerToast('All homework complete — Task Master unlocked!')
  }
}

/** Homework / leave / broadcast / calendar actions. */
// oxlint-disable-next-line typescript/no-explicit-any
export function createSchoolOpsActions(set: any, get: any) {
  return {
    assignHomework: ({
      subject,
      task,
      due,
      xp,
      difficulty,
    }: {
      subject: string
      task: string
      due: string
      xp: number
      difficulty: HomeworkTask['difficulty']
    }) => {
      const className = resolveClassLabel({
        linkedClassName: get().linkedStudent?.className,
        linkedSection: get().linkedStudent?.section,
      })
      const entry: HomeworkTask = {
        id: Date.now(),
        subject,
        task,
        due,
        xp,
        difficulty,
        completed: false,
      }
      set((s: { tasks: HomeworkTask[]; attendanceRecords: Parameters<typeof attendancePercent>[0] }) => {
        const tasks = [entry, ...s.tasks]
        const studyScore = computeStudyScore(attendancePercent(s.attendanceRecords), homeworkPercent(tasks))
        return { tasks, studyScore }
      })
      void syncAssignHomework({ ...entry, className }).then((result) => {
        if (!result.ok) {
          set((s: { tasks: HomeworkTask[]; attendanceRecords: Parameters<typeof attendancePercent>[0] }) => ({
            tasks: s.tasks.filter((t) => t.id !== entry.id),
            studyScore: computeStudyScore(
              attendancePercent(s.attendanceRecords),
              homeworkPercent(s.tasks.filter((t) => t.id !== entry.id)),
            ),
          }))
          get().triggerToast(friendlyError(result.error))
          return
        }
        if (result.data) {
          set((s: { tasks: HomeworkTask[] }) => ({
            tasks: s.tasks.map((t) => (t.id === entry.id ? { ...t, id: result.data! } : t)),
          }))
        }
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
      })
    },

    toggleTask: (id: number) => {
      const before = get().tasks.find((t: HomeworkTask) => t.id === id) as HomeworkTask | undefined
      if (!before) return
      const nextCompleted = !before.completed
      set((s: {
        tasks: HomeworkTask[]
        attendanceRecords: Parameters<typeof attendancePercent>[0]
      }) => {
        const tasks = s.tasks.map((task) => {
          if (task.id !== id) return task
          return { ...task, completed: nextCompleted }
        })
        const studyScore = computeStudyScore(attendancePercent(s.attendanceRecords), homeworkPercent(tasks))
        return { tasks, studyScore }
      })
      void syncToggleHomework(id, nextCompleted, get().linkedStudent?.id).then(async (result) => {
        if (!result.ok) {
          set((s: {
            tasks: HomeworkTask[]
            attendanceRecords: Parameters<typeof attendancePercent>[0]
          }) => {
            const tasks = s.tasks.map((task) =>
              task.id === id ? { ...task, completed: before.completed } : task,
            )
            return {
              tasks,
              studyScore: computeStudyScore(attendancePercent(s.attendanceRecords), homeworkPercent(tasks)),
            }
          })
          get().triggerToast(friendlyError(result.error))
          return
        }
        if (nextCompleted) {
          const tasks = get().tasks as HomeworkTask[]
          const allDone = tasks.length > 0 && tasks.every((t) => t.completed)
          await awardAfterHomework(get, before, allDone)
        }
      })
    },

    submitLeave: (date: string, reason: string, teacherName?: string) => {
      const name = teacherName?.trim() || 'Teacher'
      const entry: LeaveRequest = { id: Date.now(), date, reason, status: 'Reviewing', teacherName: name }
      set((s: { leaves: LeaveRequest[] }) => ({ leaves: [entry, ...s.leaves] }))
      void syncSubmitLeave({ date, reason }).then((result) => {
        if (!result.ok) {
          set((s: { leaves: LeaveRequest[] }) => ({ leaves: s.leaves.filter((l) => l.id !== entry.id) }))
          get().triggerToast(friendlyError(result.error))
          return
        }
        if (result.data) {
          set((s: { leaves: LeaveRequest[] }) => ({
            leaves: s.leaves.map((l) => (l.id === entry.id ? { ...l, id: result.data! } : l)),
          }))
        }
        get().pushNotification({
          role: 'school',
          title: 'Leave request',
          body: `${name} · ${date}: ${reason}`,
        })
        get().triggerToast('Leave submitted — awaiting school approval.')
      })
    },

    setLeaveStatus: (id: number, status: LeaveStatus) => {
      const leave = get().leaves.find((l: LeaveRequest) => l.id === id) as LeaveRequest | undefined
      const prevStatus = leave?.status
      set((s: { leaves: LeaveRequest[] }) => ({
        leaves: s.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
      }))
      void syncSetLeaveStatus(id, status).then((result) => {
        if (!result.ok) {
          if (prevStatus) {
            set((s: { leaves: LeaveRequest[] }) => ({
              leaves: s.leaves.map((l) => (l.id === id ? { ...l, status: prevStatus } : l)),
            }))
          }
          get().triggerToast(friendlyError(result.error))
          return
        }
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
      })
    },

    submitBroadcast: (title: string, target: string, content: string) => {
      const msg: BroadcastMessage = { id: Date.now(), title, target, content, date: 'Just Now' }
      set((s: { broadcasts: BroadcastMessage[] }) => ({ broadcasts: [msg, ...s.broadcasts] }))
      void syncBroadcast(msg).then((result) => {
        if (!result.ok) {
          set((s: { broadcasts: BroadcastMessage[] }) => ({
            broadcasts: s.broadcasts.filter((b) => b.id !== msg.id),
          }))
          get().triggerToast(friendlyError(result.error))
          return
        }
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
      })
    },

    addCalendarEvent: (title: string, category: CalendarEvent['category'], date: string) => {
      const entry = { id: Date.now(), title, category, date }
      set((s: { calendarEvents: CalendarEvent[] }) => ({
        calendarEvents: [entry, ...s.calendarEvents],
      }))
      void syncCalendarEvent(entry).then((result) => {
        if (!result.ok) {
          set((s: { calendarEvents: CalendarEvent[] }) => ({
            calendarEvents: s.calendarEvents.filter((e) => e.id !== entry.id),
          }))
          get().triggerToast(friendlyError(result.error))
          return
        }
        if (category === 'PTA Meetings' || category === 'Holidays') {
          get().submitBroadcast(title, 'All', `${category} scheduled for ${date}.`)
        } else {
          get().triggerToast('Event added to school calendar.')
        }
      })
    },
  }
}
