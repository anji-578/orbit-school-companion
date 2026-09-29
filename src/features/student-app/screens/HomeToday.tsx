import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Flame, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childDisplayName } from '../../../lib/linkedStudent'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { InviteRedeemCard } from '../../../components/ui/InviteRedeemCard'
import type { HomeworkTask } from '../../../types'
import { SaPrimaryButton, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function presentStreak(records: { status: string }[]): number {
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]?.status === 'Present') streak += 1
    else break
  }
  return streak
}

function taskMinutes(task: HomeworkTask): number {
  if (task.estimatedMinutes != null) return task.estimatedMinutes
  if (task.difficulty === 'Hard') return 45
  if (task.difficulty === 'Easy') return 15
  return 25
}

function dueUrgency(due: string): number {
  const d = due.toLowerCase()
  if (d.includes('tomorrow') || d === 'tomorrow' || d.includes('today')) return 0
  if (d.includes('2 day')) return 1
  if (d.includes('completed')) return 9
  return 2
}

function minutesUntilAmPm(label: string, now = new Date()): number | null {
  const m = label.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2])
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  const target = new Date(now)
  target.setHours(h, min, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 60000)
}

/** Phase 2 Home — 5-second briefing: Next · Priority · open Today · quiet streak. */
export function HomeToday() {
  const { push, openAskOrbit } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const tasks = useOrbitStore((s) => s.tasks)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const startTask = useOrbitStore((s) => s.startTask)
  const toggleTask = useOrbitStore((s) => s.toggleTask)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [showDone, setShowDone] = useState(false)

  const name = childDisplayName(linkedStudent, session?.displayName || 'Student').split(' ')[0]
  const streak = presentStreak(attendanceRecords)

  const pending = useMemo(
    () =>
      [...tasks.filter((t) => !t.completed)].sort(
        (a, b) => dueUrgency(a.due) - dueUrgency(b.due) || taskMinutes(b) - taskMinutes(a),
      ),
    [tasks],
  )

  const timeline = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )
  const nextLive = timeline.find((item) => item.status !== 'Completed')
  const classInMins = nextLive ? minutesUntilAmPm(nextLive.time) : null
  const urgentHw = pending.find((t) => dueUrgency(t.due) === 0) ?? pending[0]

  const { openItems, doneItems } = useMemo(() => {
    const open: { id: string; title: string; onOpen: () => void }[] = []
    const done: { id: string; title: string; onOpen: () => void }[] = []

    for (const t of tasks) {
      const entry = {
        id: `hw-${t.id}`,
        title: `${t.subject}: ${t.task}`,
        onOpen: () => push('homework', { subject: t.subject, taskId: t.id }, 'Homework'),
      }
      if (t.completed) done.push(entry)
      else open.push(entry)
    }
    for (const period of timeline) {
      const entry = {
        id: `class-${period.name}-${period.time}`,
        title: `${period.name} · ${period.time}`,
        onOpen: () => push('subject', { subject: period.name }, period.name),
      }
      if (period.status === 'Completed') done.push(entry)
      else open.push(entry)
    }
    return { openItems: open.slice(0, 5), doneItems: done }
  }, [tasks, timeline, push])

  return (
    <div className="space-y-5 pb-6">
      {!classLinked ? <InviteRedeemCard /> : null}

      <div className="px-0.5 pt-1">
        <p className="text-[11px] font-bold text-[var(--muted)]">{greeting()}</p>
        <h1 className="font-display text-2xl font-extrabold text-[var(--fg)] tracking-tight">{name}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">What matters now</p>
      </div>

      <SaSection eyebrow="Next">
        {nextLive ? (
          <div className="space-y-3 px-0.5">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => push('subject', { subject: nextLive.name }, nextLive.name)}
            >
              <p className="text-lg font-extrabold text-[var(--fg)] leading-snug">{nextLive.name}</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Class · {nextLive.time}
                {classInMins != null && classInMins >= 0 ? ` · in ${classInMins} min` : ''}
              </p>
            </button>
            <SaPrimaryButton onClick={() => openAskOrbit(`Help me get ready for ${nextLive.name}.`)}>
              Get ready
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </SaPrimaryButton>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)] px-0.5">No more classes today — nice work.</p>
        )}
      </SaSection>

      <SaSection eyebrow="Priority">
        <div
          className={`rounded-2xl px-4 py-4 space-y-3 ${
            urgentHw
              ? 'bg-[var(--accent)]/8 border border-[var(--accent)]/25'
              : 'bg-emerald-500/8 border border-emerald-500/20'
          }`}
        >
          {urgentHw ? (
            <>
              <div>
                <p className="text-base font-extrabold text-[var(--fg)] leading-snug">
                  {urgentHw.subject} homework
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {urgentHw.task} · Due {urgentHw.due} · ~{taskMinutes(urgentHw)} min
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SaPrimaryButton
                  onClick={() => {
                    if (!urgentHw.started) {
                      startTask(urgentHw.id)
                      triggerToast('Homework started')
                    }
                    push('homework', { subject: urgentHw.subject, taskId: urgentHw.id }, 'Homework')
                  }}
                >
                  {urgentHw.started ? 'Continue' : 'Start'}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </SaPrimaryButton>
                {urgentHw.started ? (
                  <button
                    type="button"
                    className="text-[11px] font-bold text-[var(--accent)]"
                    onClick={() => {
                      toggleTask(urgentHw.id)
                      triggerToast('Marked done')
                    }}
                  >
                    Mark done
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <p className="text-base font-extrabold text-[var(--fg)]">You&apos;re caught up</p>
              <p className="text-xs text-[var(--muted)]">Try a challenge in Grow, or revisit a subject.</p>
              <SaPrimaryButton onClick={() => push('gk-quiz')}>
                Quick challenge
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </SaPrimaryButton>
            </>
          )}
        </div>
      </SaSection>

      <SaSection
        eyebrow="Today"
        action={
          <button type="button" className="text-[10px] font-bold text-[var(--accent)]" onClick={() => push('upcoming')}>
            Upcoming →
          </button>
        }
      >
        {openItems.length === 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold flex items-center gap-2 px-0.5 py-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            Nothing open for today
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {openItems.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={item.onOpen} className="w-full flex items-center gap-3 py-3 text-left px-0.5">
                  <Circle className="h-4 w-4 text-[var(--muted)] shrink-0" aria-hidden />
                  <span className="text-sm font-semibold text-[var(--fg)] truncate">{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {doneItems.length > 0 ? (
          <div className="pt-1">
            <button
              type="button"
              className="text-[10px] font-bold text-[var(--muted)]"
              onClick={() => setShowDone((v) => !v)}
            >
              {showDone ? 'Hide completed' : `Show ${doneItems.length} completed`}
            </button>
            {showDone ? (
              <ul className="mt-1 divide-y divide-[var(--border)] opacity-60">
                {doneItems.slice(0, 6).map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={item.onOpen} className="w-full flex items-center gap-3 py-2.5 text-left px-0.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
                      <span className="text-xs font-semibold text-[var(--muted)] line-through truncate">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </SaSection>

      <div className="flex items-center gap-3 px-0.5 pt-1">
        <Flame className="h-4 w-4 text-orange-500 shrink-0" aria-hidden />
        <p className="text-xs text-[var(--muted)] flex-1">
          {streak > 0 ? (
            <>
              <span className="font-bold text-[var(--fg)]">{streak}-day streak</span>
              {' · show up tomorrow to keep it'}
            </>
          ) : (
            'Start a presence streak by showing up tomorrow'
          )}
        </p>
      </div>
    </div>
  )
}
