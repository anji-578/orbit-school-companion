import { computeStudyScore } from '../lib/studyScore'
import { upsertAttendanceMarkQueued } from '../lib/attendanceQueue'
import { resolveClassLabel } from '../lib/schoolPolicy'
import { friendlyError } from '../lib/errors'
import type { AttendanceRecord } from '../types'
import { attendancePercent, homeworkPercent } from './orbitHelpers'

/** Roster / attendance mark actions extracted from orbitStore. */
// oxlint-disable-next-line typescript/no-explicit-any
export function createAttendanceActions(set: any, get: any) {
  return {
    toggleRosterPresent: (id: string) => {
      const state = get()
      const student = state.roster.find((r: { id: string }) => r.id === id) as
        | { id: string; name: string; present: boolean; isDemo?: boolean }
        | undefined
      if (!student) return

      const nextPresent = !student.present
      set({
        roster: state.roster.map((r: { id: string; present: boolean }) =>
          r.id === id ? { ...r, present: nextPresent } : r,
        ),
      })
      void upsertAttendanceMarkQueued(id, nextPresent).then((result) => {
        if (!result.ok && !result.queued) {
          set((s: { roster: { id: string; present: boolean }[] }) => ({
            roster: s.roster.map((r) => (r.id === id ? { ...r, present: !nextPresent } : r)),
          }))
          get().triggerToast(friendlyError(result.error || 'Could not save attendance.'))
          return
        }
        if (result.queued) get().triggerToast('Saved offline — will sync when back online.')

        const classLabel = resolveClassLabel({
          linkedClassName: get().linkedStudent?.className,
          linkedSection: get().linkedStudent?.section,
        })

        if (student.isDemo || student.id === get().linkedStudent?.id) {
          const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' })
          set((s: { attendanceRecords: AttendanceRecord[]; tasks: { completed: boolean }[] }) => {
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
              studyScore: computeStudyScore(attendancePercent(records), homeworkPercent(s.tasks as never)),
            }
          })
        }

        get().pushNotification({
          role: 'parent',
          title: nextPresent ? 'Attendance: Present' : 'Attendance Alert',
          body: `${student.name} marked ${nextPresent ? 'Present' : 'Absent'} in ${classLabel}.`,
          studentId: student.id,
        })
        get().pushNotification({
          role: 'student',
          title: 'Attendance updated',
          body: `Your status is now ${nextPresent ? 'Present' : 'Absent'} for today.`,
          studentId: student.id,
        })
        get().triggerToast(
          `${student.name} marked ${nextPresent ? 'Present' : 'Absent'} — students and parents see view-only.`,
        )
      })
    },

    markAllRosterPresent: () => {
      const state = get()
      if (!state.roster.length) {
        get().triggerToast('Roster is empty.')
        return
      }
      const needsMark = state.roster.filter((r: { present: boolean }) => !r.present)
      set({
        roster: state.roster.map((r: { present: boolean }) => ({ ...r, present: true })),
      })
      needsMark.forEach((s: { id: string }) => {
        void upsertAttendanceMarkQueued(s.id, true)
      })
      get().triggerToast(
        needsMark.length
          ? `Marked all ${state.roster.length} present (1 tap).`
          : 'Everyone already present.',
      )
    },

    broadcastAbsentees: () => {
      const absentees = get().roster.filter((s: { present: boolean }) => !s.present) as {
        id: string
        name: string
      }[]
      if (!absentees.length) {
        get().triggerToast('All students present — no alerts needed.')
        return
      }
      absentees.forEach((s) => {
        get().pushNotification({
          role: 'parent',
          title: 'Absentee Alert',
          body: `${s.name} was marked absent today. Please confirm.`,
          studentId: s.id,
        })
      })
      get().triggerToast(
        `Alerts queued for: ${absentees.map((a) => a.name).join(', ')} (in-app + push/SMS if enabled)`,
      )
    },
  }
}
