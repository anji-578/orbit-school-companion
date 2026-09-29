import { useMemo } from 'react'
import { CheckCircle2, Circle, Flame, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childDisplayName } from '../../../lib/linkedStudent'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { InviteRedeemCard } from '../../../components/ui/InviteRedeemCard'
import type { HomeworkTask } from '../../../types'
import { SaCard, SaPrimaryButton, SaSection } from '../components/SaUi'
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

/** Home = Today. Only Next · Priority · Today checklist · one progress signal. */
export function HomeToday() {
  const { push } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const tasks = useOrbitStore((s) => s.tasks)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const startTask = useOrbitStore((s) => s.startTask)
  const toggleTask = useOrbitStore((s) => s.toggleTask)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const notifications = useOrbitStore((s) => s.notifications)

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

  const todayItems = useMemo(() => {
    const items: { id: string; done: boolean; title: string; onOpen: () => void }[] = []
    for (const t of tasks.slice(0, 5)) {
      items.push({
        id: `hw-${t.id}`,
        done: t.completed,
        title: `${t.subject}: ${t.task}`,
        onOpen: () => push('homework'),
      })
    }
    for (const period of timeline.slice(0, 3)) {
      items.push({
        id: `class-${period.name}-${period.time}`,
        done: period.status === 'Completed',
        title: `${period.name} class`,
        onOpen: () => push('schedule'),
      })
    }
    return items.slice(0, 6)
  }, [tasks, timeline, push])

  const topAlert = notifications.find((a) => a.unread && (a.role === 'student' || a.role === 'all'))

  return (
    <div className="space-y-4 pb-4">
      {!classLinked ? <InviteRedeemCard /> : null}

      <div className="px-0.5 pt-1">
        <p className="text-[11px] font-bold text-[var(--muted)]">{greeting()}</p>
        <h1 className="font-display text-2xl font-extrabold text-[var(--fg)] tracking-tight">
          {name} <span aria-hidden>👋</span>
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">Here&apos;s what matters today</p>
      </div>

      {/* NEXT */}
      <SaSection eyebrow="Next">
        <SaCard className="p-4 space-y-3">
          {nextLive ? (
            <>
              <button type="button" className="w-full text-left" onClick={() => push('schedule')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-[var(--fg)] truncate">{nextLive.name}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {nextLive.time}
                      {classInMins != null && classInMins >= 0 ? ` · in ${classInMins} min` : ''}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg">
                    Class
                  </span>
                </div>
              </button>
              <SaPrimaryButton onClick={() => push('study-assistant')}>
                Get ready
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </SaPrimaryButton>
            </>
          ) : (
            <p className="text-sm font-semibold text-[var(--muted)]">No more classes today — nice work.</p>
          )}
        </SaCard>
      </SaSection>

      {/* PRIORITY */}
      <SaSection eyebrow="Your priority">
        <SaCard
          className={`p-4 space-y-3 ${
            urgentHw ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5' : 'border-emerald-500/30 bg-emerald-500/5'
          }`}
        >
          {urgentHw ? (
            <>
              <div>
                <p className="text-base font-extrabold text-[var(--fg)] leading-snug">
                  Complete {urgentHw.subject} homework
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {urgentHw.task} · Due {urgentHw.due} · ~{taskMinutes(urgentHw)} min
                </p>
              </div>
              <SaPrimaryButton
                onClick={() => {
                  if (!urgentHw.started) {
                    startTask(urgentHw.id)
                    triggerToast('Homework started')
                  }
                  push('homework')
                }}
              >
                {urgentHw.started ? 'Continue' : 'Start'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </SaPrimaryButton>
              {urgentHw.started ? (
                <button
                  type="button"
                  className="text-[11px] font-bold text-[var(--accent2)]"
                  onClick={() => {
                    toggleTask(urgentHw.id)
                    triggerToast('Marked done')
                  }}
                >
                  Mark as done
                </button>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-base font-extrabold text-[var(--fg)]">You&apos;re caught up</p>
              <p className="text-xs text-[var(--muted)]">Explore something in Grow, or try a quick quiz.</p>
              <SaPrimaryButton onClick={() => push('gk-quiz')}>
                Try a quiz
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </SaPrimaryButton>
            </>
          )}
        </SaCard>
      </SaSection>

      {/* TODAY checklist */}
      <SaSection
        eyebrow="Today"
        action={
          <button type="button" className="text-[10px] font-bold text-[var(--accent)]" onClick={() => push('homework')}>
            View all →
          </button>
        }
      >
        <SaCard className="p-2">
          {todayItems.length === 0 ? (
            <p className="p-3 text-xs text-emerald-600 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Nothing left for today
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {todayItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={item.onOpen}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
                    ) : (
                      <Circle className="h-4 w-4 text-[var(--muted)] shrink-0" aria-hidden />
                    )}
                    <span
                      className={`text-xs font-semibold truncate ${
                        item.done ? 'text-[var(--muted)] line-through' : 'text-[var(--fg)]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SaCard>
      </SaSection>

      {/* One progress signal */}
      <SaCard className="p-4 flex items-center gap-3">
        <span className="h-10 w-10 rounded-2xl bg-orange-500/15 flex items-center justify-center">
          <Flame className="h-5 w-5 text-orange-500" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-[var(--fg)]">
            {streak > 0 ? `You\u2019re on a ${streak}-day streak` : 'Start a presence streak'}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Show up tomorrow to keep it going</p>
        </div>
        <button
          type="button"
          onClick={() => push('attendance')}
          className="text-[10px] font-bold text-[var(--accent)] shrink-0"
        >
          Details →
        </button>
      </SaCard>

      {topAlert ? (
        <SaCard className="p-4 space-y-1" onClick={() => push('alerts')}>
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-300">
            Announcement
          </p>
          <p className="text-sm font-bold text-[var(--fg)] line-clamp-2">{topAlert.title}</p>
          <p className="text-[11px] text-[var(--muted)] line-clamp-2">{topAlert.body}</p>
        </SaCard>
      ) : null}
    </div>
  )
}
