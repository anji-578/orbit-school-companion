import { useMemo } from 'react'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { SaCard, SaPrimaryButton, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import type { HomeworkTask } from '../../../types'

function taskMinutes(task: HomeworkTask): number {
  if (task.estimatedMinutes != null) return task.estimatedMinutes
  if (task.difficulty === 'Hard') return 45
  if (task.difficulty === 'Easy') return 15
  return 25
}

function dueUrgency(due: string): number {
  const d = due.toLowerCase()
  if (d.includes('tomorrow') || d.includes('today')) return 0
  if (d.includes('2 day')) return 1
  return 2
}

const SUBJECT_COLORS = ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2']

/** Learn = Continue · Subjects · Upcoming. No feature directory. */
export function LearnHub() {
  const { push } = useStudentNav()
  const tasks = useOrbitStore((s) => s.tasks)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)

  const pending = tasks.filter((t) => !t.completed)
  const continueTask = [...pending].sort((a, b) => dueUrgency(a.due) - dueUrgency(b.due))[0]

  const subjects = useMemo(() => {
    const fromSyllabus = curriculum.map((s) => s.subject).filter(Boolean)
    const fromGrades = studentGrades[0] ? ['Mathematics', 'Science', 'Chemistry'] : []
    const fromTasks = tasks.map((t) => t.subject)
    return [...new Set([...fromSyllabus, ...fromGrades, ...fromTasks])]
  }, [curriculum, studentGrades, tasks])

  const continuePct = continueTask
    ? continueTask.completed
      ? 100
      : continueTask.started
        ? 65
        : 20
    : 0

  const upcomingPreview = useMemo(() => {
    const items: { id: string; title: string; meta: string; onOpen: () => void }[] = []
    const classes = deriveTodayTimeline(timetableByDay[currentDayCode()]).filter((c) => c.status !== 'Completed')
    for (const c of classes.slice(0, 2)) {
      items.push({
        id: `c-${c.name}-${c.time}`,
        title: c.name,
        meta: `Class · ${c.time}`,
        onOpen: () => push('upcoming'),
      })
    }
    for (const t of pending.slice(0, 2)) {
      items.push({
        id: `h-${t.id}`,
        title: t.task,
        meta: `${t.subject} · Due ${t.due}`,
        onOpen: () => push('subject', { subject: t.subject }, t.subject),
      })
    }
    for (const ev of calendarEvents.filter((e) => e.category === 'Exams').slice(0, 1)) {
      items.push({
        id: `e-${ev.id}`,
        title: ev.title,
        meta: `Assessment · ${ev.date}`,
        onOpen: () => push('upcoming'),
      })
    }
    return items.slice(0, 4)
  }, [timetableByDay, pending, calendarEvents, push])

  return (
    <div className="space-y-5 pb-4">
      <div className="px-0.5">
        <h1 className="font-display text-xl font-extrabold text-[var(--fg)]">Learn</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Continue where you left off</p>
      </div>

      <SaSection eyebrow="Continue">
        <SaCard className="p-4 space-y-3">
          {continueTask ? (
            <>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  {continueTask.subject}
                </p>
                <p className="text-base font-extrabold text-[var(--fg)] mt-1 leading-snug">{continueTask.task}</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  {continuePct}% · ~{taskMinutes(continueTask)} min · Due {continueTask.due}
                </p>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${continuePct}%`,
                    background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  }}
                />
              </div>
              <SaPrimaryButton
                onClick={() =>
                  push('homework', { subject: continueTask.subject, taskId: continueTask.id }, 'Homework')
                }
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </SaPrimaryButton>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">You&apos;re caught up — pick a subject to explore.</p>
          )}
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Your subjects">
        {subjects.length === 0 ? (
          <SaCard className="p-4">
            <p className="text-xs text-[var(--muted)]">Subjects appear when your school links a syllabus.</p>
          </SaCard>
        ) : (
          <ul className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] divide-y divide-[var(--border)] overflow-hidden">
            {subjects.map((subject, i) => (
              <li key={subject}>
                <button
                  type="button"
                  onClick={() => push('subject', { subject }, subject)}
                  className="w-full flex items-center gap-3 px-3.5 py-3.5 text-left"
                >
                  <span
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                    style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
                  >
                    {subject.slice(0, 1)}
                  </span>
                  <span className="flex-1 text-sm font-bold text-[var(--fg)] truncate">{subject}</span>
                  <ArrowRight className="h-4 w-4 text-[var(--muted)] shrink-0" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SaSection>

      <SaSection
        eyebrow="Upcoming"
        action={
          <button type="button" className="text-[10px] font-bold text-[var(--accent)]" onClick={() => push('upcoming')}>
            View all →
          </button>
        }
      >
        {upcomingPreview.length === 0 ? (
          <SaCard className="p-4">
            <p className="text-xs text-[var(--muted)]">Nothing urgent coming up.</p>
          </SaCard>
        ) : (
          <SaCard className="p-2">
            <ul className="divide-y divide-[var(--border)]">
              {upcomingPreview.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={item.onOpen} className="w-full flex items-start gap-3 px-3 py-3 text-left">
                    <CalendarDays className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[var(--fg)] truncate">{item.title}</span>
                      <span className="text-[11px] text-[var(--muted)]">{item.meta}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </SaCard>
        )}
      </SaSection>
    </div>
  )
}
