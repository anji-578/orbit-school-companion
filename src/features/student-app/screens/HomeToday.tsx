import { useMemo } from 'react'
import { ArrowRight, CheckCircle2, Circle, Flame } from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childDisplayName } from '../../../lib/linkedStudent'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { InviteRedeemCard } from '../../../components/ui/InviteRedeemCard'
import { useStudentNav } from '../StudentNavContext'
import { presentStreak } from '@/domain/streak/present-streak'
import { selectUrgentHomework, taskMinutes } from '@/domain/priority/homework-priority'

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
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

/** Home — refined glance briefing matching the Orbit product mock. */
export function HomeToday() {
  const { push, openAskOrbit } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const tasks = useOrbitStore((s) => s.tasks)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const startTask = useOrbitStore((s) => s.startTask)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const name = childDisplayName(linkedStudent, session?.displayName || 'Student').split(' ')[0]
  const streak = presentStreak(attendanceRecords)

  const timeline = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )
  const nextLive = timeline.find((item) => item.status !== 'Completed')
  const classInMins = nextLive ? minutesUntilAmPm(nextLive.time) : null
  const urgentHw = useMemo(() => selectUrgentHomework(tasks), [tasks])

  const todayItems = useMemo(() => {
    type Item = { id: string; done: boolean; title: string; onOpen: () => void }
    const open: Item[] = []
    const done: Item[] = []

    for (const t of tasks) {
      const entry: Item = {
        id: `hw-${t.id}`,
        done: t.completed,
        title: `${t.subject}: ${t.task}`,
        onOpen: () => push('homework', { subject: t.subject, taskId: t.id }, 'Homework'),
      }
      ;(t.completed ? done : open).push(entry)
    }
    for (const period of timeline) {
      const entry: Item = {
        id: `class-${period.name}-${period.time}`,
        done: period.status === 'Completed',
        title: `${period.name} class`,
        onOpen: () => push('subject', { subject: period.name }, period.name),
      }
      ;(period.status === 'Completed' ? done : open).push(entry)
    }

    // Mock order: open work first, then one completed, then remaining open classes
    return [...open.slice(0, 3), ...done.slice(0, 1), ...open.slice(3, 5)].slice(0, 6)
  }, [tasks, timeline, push])

  return (
    <div className="home-glance space-y-5 pb-8">
      {!classLinked ? <InviteRedeemCard /> : null}

      <header className="pt-1 px-0.5">
        <p className="text-[13px] font-medium text-[var(--home-muted)]">{greeting()}</p>
        <h1 className="mt-1 text-[1.75rem] font-bold tracking-tight text-[var(--fg)] leading-none">
          {name} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-[13px] text-[var(--home-muted)]">Here&apos;s what matters today</p>
      </header>

      <section className="space-y-2.5">
        <p className="home-eyebrow px-0.5">Next</p>
        <div className="home-card p-4">
          {nextLive ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => push('subject', { subject: nextLive.name }, nextLive.name)}
                >
                  <p className="text-[1.05rem] font-bold text-[var(--fg)] leading-snug">{nextLive.name}</p>
                  <p className="mt-1.5 text-[12px] text-[var(--home-muted)]">
                    {nextLive.time}
                    {classInMins != null && classInMins >= 0 ? ` · in ${classInMins} min` : ''}
                  </p>
                </button>
                <span className="home-badge shrink-0">Class</span>
              </div>
              <button
                type="button"
                className="home-cta mt-4"
                onClick={() => openAskOrbit(`Help me get ready for ${nextLive.name}.`)}
              >
                Get ready
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </>
          ) : (
            <p className="text-[13px] text-[var(--home-muted)]">No more classes today — nice work.</p>
          )}
        </div>
      </section>

      <section className="space-y-2.5">
        <p className="home-eyebrow px-0.5">Your priority</p>
        <div className="home-card p-4">
          {urgentHw ? (
            <>
              <p className="text-[1.05rem] font-bold text-[var(--fg)] leading-snug">
                Complete {urgentHw.subject} homework
              </p>
              <p className="mt-1.5 text-[12px] text-[var(--home-muted)] leading-relaxed">
                {urgentHw.task} · Due {urgentHw.due} · ~{taskMinutes(urgentHw)} min
              </p>
              <button
                type="button"
                className="home-cta mt-4"
                onClick={() => {
                  const taskId = Number(urgentHw.id)
                  if (!urgentHw.started && Number.isFinite(taskId)) {
                    startTask(taskId)
                    triggerToast('Homework started')
                  }
                  push('homework', { subject: urgentHw.subject, taskId: urgentHw.id }, 'Homework')
                }}
              >
                {urgentHw.started ? 'Continue' : 'Start'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </>
          ) : (
            <>
              <p className="text-[1.05rem] font-bold text-[var(--fg)]">You&apos;re caught up</p>
              <p className="mt-1.5 text-[12px] text-[var(--home-muted)]">
                Nothing urgent — try a quick challenge when you&apos;re ready.
              </p>
              <button type="button" className="home-cta mt-4" onClick={() => push('gk-quiz')}>
                Try a quiz
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </>
          )}
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-end justify-between gap-2 px-0.5">
          <p className="home-eyebrow">Today</p>
          <button type="button" className="home-link" onClick={() => push('upcoming')}>
            View all →
          </button>
        </div>
        <div className="home-card overflow-hidden">
          {todayItems.length === 0 ? (
            <p className="px-4 py-5 text-[13px] text-[var(--home-muted)]">Nothing left for today.</p>
          ) : (
            <ul>
              {todayItems.map((item, i) => (
                <li key={item.id} className={i > 0 ? 'border-t border-[var(--home-divider)]' : ''}>
                  <button
                    type="button"
                    onClick={item.onOpen}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-[18px] w-[18px] text-emerald-500 shrink-0" aria-hidden />
                    ) : (
                      <Circle className="h-[18px] w-[18px] text-[var(--home-muted)]/70 shrink-0" aria-hidden />
                    )}
                    <span
                      className={`text-[13px] font-medium truncate ${
                        item.done ? 'text-[var(--home-muted)] line-through' : 'text-[var(--fg)]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="home-card p-4 flex items-center gap-3">
        <span className="h-10 w-10 rounded-xl bg-orange-500/12 flex items-center justify-center shrink-0">
          <Flame className="h-5 w-5 text-orange-400" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-[var(--fg)]">
            {streak > 0 ? `You\u2019re on a ${streak}-day streak` : 'Start a presence streak'}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--home-muted)]">Show up tomorrow to keep it going</p>
        </div>
        <button type="button" className="home-link shrink-0" onClick={() => push('school-records')}>
          Details →
        </button>
      </section>
    </div>
  )
}
