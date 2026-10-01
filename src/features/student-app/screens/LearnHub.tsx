import { useMemo } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  ChartColumn,
  ChevronRight,
  Clock3,
  FlaskConical,
  Sparkles,
  Target,
} from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { chapterProgress } from '../../../store/orbitHelpers'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { SaPrimaryButton, SaSection, SaViewAll } from '../components/SaUi'
import { SaEmpty } from '../components/NestedChrome'
import { useStudentNav } from '../StudentNavContext'
import { subjectTheme } from '../subjectTheme'
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

const TOOLS = [
  { title: 'Ask Orbit', desc: 'Homework help', icon: Sparkles, tone: 'text-violet-300 bg-violet-500/15', dest: 'study-assistant' as const },
  { title: 'Scan & Solve', desc: 'Photo a question', icon: Camera, tone: 'text-rose-300 bg-rose-500/15', dest: 'scanner' as const },
  { title: 'Practice Quiz', desc: 'Quick challenge', icon: Target, tone: 'text-amber-300 bg-amber-500/15', dest: 'gk-quiz' as const },
  { title: 'Syllabus', desc: 'Topics & coverage', icon: BookOpen, tone: 'text-sky-300 bg-sky-500/15', dest: 'syllabus' as const },
  { title: 'Calendar', desc: 'This week', icon: CalendarDays, tone: 'text-teal-300 bg-teal-500/15', dest: 'calendar' as const },
  { title: 'Progress', desc: 'Reports', icon: ChartColumn, tone: 'text-violet-300 bg-violet-500/15', dest: 'academics' as const },
]

export function LearnHub() {
  const { push } = useStudentNav()
  const tasks = useOrbitStore((s) => s.tasks)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)

  const pending = tasks.filter((t) => !t.completed)
  const continueTask = [...pending].sort((a, b) => dueUrgency(a.due) - dueUrgency(b.due))[0]
  const continueChapter = useMemo(() => {
    if (continueTask) return null
    return curriculum.find((c) => chapterProgress(c) < 100) ?? null
  }, [continueTask, curriculum])

  const subjects = useMemo(() => {
    const fromSyllabus = curriculum.map((s) => s.subject).filter(Boolean)
    const fromTasks = tasks.map((t) => t.subject)
    const list = [...new Set([...fromSyllabus, ...fromTasks])]
    return list.length > 0 ? list : ['Mathematics', 'Science', 'Chemistry', 'English']
  }, [curriculum, tasks])

  const subjectMeta = useMemo(() => {
    return subjects.slice(0, 4).map((subject) => {
      const chapters = curriculum.filter((c) => c.subject.toLowerCase() === subject.toLowerCase())
      const avg =
        chapters.length === 0
          ? 0
          : Math.round(chapters.reduce((sum, c) => sum + chapterProgress(c), 0) / chapters.length)
      return { subject, avg, theme: subjectTheme(subject) }
    })
  }, [subjects, curriculum])

  const continuePct = continueTask ? (continueTask.started ? 55 : 15) : continueChapter ? chapterProgress(continueChapter) : 0
  const continueTheme = subjectTheme(continueTask?.subject ?? continueChapter?.subject ?? 'Science')

  const upcomingPreview = useMemo(() => {
    const items: { id: string; title: string; meta: string; when: string; tone: string; onOpen: () => void }[] = []
    const classes = deriveTodayTimeline(timetableByDay[currentDayCode()]).filter((c) => c.status !== 'Completed')
    for (const c of classes.slice(0, 2)) {
      items.push({
        id: `c-${c.name}-${c.time}`,
        title: c.name,
        meta: `Class · ${c.time}`,
        when: 'Today',
        tone: 'bg-blue-500/15 text-blue-300',
        onOpen: () => push('subject', { subject: c.name }, c.name),
      })
    }
    for (const t of pending.slice(0, 2)) {
      items.push({
        id: `h-${t.id}`,
        title: t.task,
        meta: `${t.subject} · Due ${t.due}`,
        when: t.due,
        tone: 'bg-emerald-500/15 text-emerald-300',
        onOpen: () => push('subject', { subject: t.subject }, t.subject),
      })
    }
    for (const ev of calendarEvents.filter((e) => e.category === 'Exams').slice(0, 1)) {
      items.push({
        id: `e-${ev.id}`,
        title: ev.title,
        meta: `Assessment · ${ev.date}`,
        when: ev.date,
        tone: 'bg-violet-500/15 text-violet-300',
        onOpen: () => push('upcoming'),
      })
    }
    return items.slice(0, 4)
  }, [timetableByDay, pending, calendarEvents, push])

  return (
    <div className="space-y-6 pb-8">
      <header className="relative overflow-hidden rounded-card border border-white/[0.08] bg-orbit-surface">
        <img
          src="/brand/orbit-home-hero.jpg"
          alt=""
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[46%] object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orbit-surface via-orbit-surface/92 to-transparent" />
        <div className="relative space-y-1 p-4 pr-[44%]">
          <h1 className="font-heading text-[1.75rem] font-bold text-white">Learn</h1>
          <p className="text-[13px] text-orbit-text-secondary">Your learning journey, made simple.</p>
        </div>
      </header>

      <div className="orbit-card space-y-3 border-emerald-500/20 bg-gradient-to-br from-[#0B2A22] to-[#0E172C]">
        {continueTask || continueChapter ? (
          <>
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide"
              style={{ background: `${continueTheme.accent}22`, color: continueTheme.accent }}
            >
              {continueTask?.subject ?? continueChapter?.subject}
            </span>
            <div>
              <p className="font-heading text-base font-bold text-white">
                {continueTask?.task ?? continueChapter?.title}
              </p>
              <p className="mt-1 text-[12px] text-orbit-text-secondary">
                {continueTask
                  ? `${continueTask.subject} · ~${taskMinutes(continueTask)} min`
                  : 'Topic in progress'}
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-orbit-text-muted">
                <span>{continuePct}% complete</span>
                {continueTask ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                    Due {continueTask.due}
                  </span>
                ) : null}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${continuePct}%`, background: continueTheme.accent }}
                />
              </div>
            </div>
            <SaPrimaryButton
              onClick={() => {
                if (continueTask) {
                  push('homework', { subject: continueTask.subject, taskId: continueTask.id }, 'Homework')
                  return
                }
                if (continueChapter) push('subject', { subject: continueChapter.subject }, continueChapter.subject)
              }}
            >
              Continue <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </SaPrimaryButton>
          </>
        ) : (
          <p className="text-sm text-orbit-text-secondary">You&apos;re caught up — pick a subject to explore.</p>
        )}
      </div>

      <SaSection eyebrow="Your subjects" action={<SaViewAll onClick={() => push('syllabus')} />}>
        {subjectMeta.length === 0 ? (
          <SaEmpty title="No subjects yet" body="Subjects appear when your school links a syllabus or assigns homework." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {subjectMeta.map(({ subject, avg, theme }) => (
              <button
                key={subject}
                type="button"
                onClick={() => push('subject', { subject }, subject)}
                className={`${theme.card} flex min-h-[132px] flex-col items-start gap-3 text-left`}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-icon text-sm font-bold text-white"
                  style={{ background: theme.accent }}
                >
                  {theme.label || subject.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-heading text-sm font-bold text-white">{subject}</span>
                  <span className="mt-1 block text-[11px] text-orbit-text-secondary">
                    {avg > 0 ? `${avg}% complete` : 'Start exploring'}
                  </span>
                </span>
                <span className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full" style={{ width: `${avg}%`, background: theme.accent }} />
                </span>
              </button>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Upcoming" action={<SaViewAll onClick={() => push('upcoming')} />}>
        {upcomingPreview.length === 0 ? (
          <p className="text-xs text-orbit-text-secondary">Nothing urgent coming up.</p>
        ) : (
          <div className="orbit-card space-y-1 p-2">
            {upcomingPreview.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onOpen}
                className="flex w-full items-center gap-3 rounded-icon px-2 py-3 text-left hover:bg-white/[0.03]"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-icon ${item.tone}`}>
                  <FlaskConical className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-orbit-text-secondary">{item.meta}</span>
                </span>
                <span className="shrink-0 text-[11px] text-orbit-text-muted">{item.when}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
              </button>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Study tools">
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map(({ title, desc, icon: Icon, tone, dest }) => (
            <button
              key={title}
              type="button"
              onClick={() => push(dest)}
              className="orbit-card-interactive flex items-start gap-2.5 text-left"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-icon ${tone}`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{title}</span>
                <span className="mt-0.5 block text-[11px] text-orbit-text-secondary">{desc}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </SaSection>
    </div>
  )
}
