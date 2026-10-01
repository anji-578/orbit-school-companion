import { useMemo } from 'react'
import { useOrbitStore } from '../../../store/orbitStore'
import { chapterProgress } from '../../../store/orbitHelpers'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { SaPrimaryButton, SaSection, SaViewAll } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import type { HomeworkTask } from '../../../types'
import {
  DateChip,
  EmptyState,
  HeroBanner,
  ICON,
  IconTile,
  ProgressBar,
  TagChip,
  formatDueLabel,
  isPastDate,
  parseFlexibleDate,
  subjectAccent,
  subjectCardGradient,
  subjectDisplayName,
  subjectIcon,
  subjectTone,
  TONE_BY_ITEM_TYPE,
} from '@/shared/ui/orbit'

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
  {
    title: 'Ask Orbit',
    hint: 'Homework help',
    icon: ICON.tool.askOrbit,
    tone: 'purple' as const,
    dest: 'study-assistant' as const,
  },
  {
    title: 'Scan & Solve',
    hint: 'Photo a question',
    icon: ICON.tool.scan,
    tone: 'red' as const,
    dest: 'scanner' as const,
  },
  {
    title: 'Practice Quiz',
    hint: 'Quick challenge',
    icon: ICON.tool.quiz,
    tone: 'amber' as const,
    dest: 'gk-quiz' as const,
  },
  {
    title: 'Syllabus',
    hint: 'Topics & coverage',
    icon: ICON.tool.syllabus,
    tone: 'blue' as const,
    dest: 'syllabus' as const,
  },
  {
    title: 'Calendar',
    hint: 'This week',
    icon: ICON.tool.calendar,
    tone: 'teal' as const,
    dest: 'calendar' as const,
  },
  {
    title: 'Progress',
    hint: 'Reports',
    icon: ICON.tool.progress,
    tone: 'purple' as const,
    dest: 'academics' as const,
  },
]

export function LearnHub() {
  const { push } = useStudentNav()
  const tasks = useOrbitStore((s) => s.tasks)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const Arrow = ICON.chrome.arrow
  const Chevron = ICON.chrome.chevron

  const pending = tasks.filter((t) => !t.completed)
  const continueTask = [...pending].sort((a, b) => dueUrgency(a.due) - dueUrgency(b.due))[0]
  const continueChapter = useMemo(() => {
    if (continueTask) return null
    return curriculum.find((c) => chapterProgress(c) < 100) ?? null
  }, [continueTask, curriculum])

  const subjects = useMemo(() => {
    const raw = [
      ...new Set([...curriculum.map((s) => s.subject), ...tasks.map((t) => t.subject)].filter(Boolean)),
    ]
    const seen = new Set<string>()
    const out: string[] = []
    for (const s of raw) {
      const key = subjectDisplayName(s).toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(subjectDisplayName(s))
    }
    return out.length > 0 ? out : ['Mathematics', 'Science', 'Chemistry', 'English']
  }, [curriculum, tasks])

  const subjectMeta = useMemo(() => {
    return subjects.map((subject) => {
      const chapters = curriculum.filter(
        (c) => subjectDisplayName(c.subject).toLowerCase() === subject.toLowerCase(),
      )
      const avg =
        chapters.length === 0
          ? 0
          : Math.round(chapters.reduce((sum, c) => sum + chapterProgress(c), 0) / chapters.length)
      return { subject, avg }
    })
  }, [subjects, curriculum])

  const continuePct = continueTask
    ? continueTask.started
      ? 55
      : 15
    : continueChapter
      ? chapterProgress(continueChapter)
      : 0

  const upcomingPreview = useMemo(() => {
    type Row = {
      id: string
      title: string
      meta: string
      kind: keyof typeof TONE_BY_ITEM_TYPE
      date: Date | null
      onOpen: () => void
    }
    const items: Row[] = []
    for (const c of deriveTodayTimeline(timetableByDay[currentDayCode()]).filter(
      (x) => x.status !== 'Completed',
    )) {
      items.push({
        id: `c-${c.name}-${c.time}`,
        title: c.name,
        meta: `Class · ${c.time}`,
        kind: 'class',
        date: new Date(),
        onOpen: () => push('subject', { subject: c.name }, c.name),
      })
    }
    for (const t of pending) {
      const d = parseFlexibleDate(t.due)
      if (isPastDate(t.due)) continue
      items.push({
        id: `h-${t.id}`,
        title: t.task,
        meta: `${t.subject} · Due ${formatDueLabel(t.due)}`,
        kind: 'homework',
        date: d,
        onOpen: () => push('subject', { subject: t.subject }, t.subject),
      })
    }
    for (const ev of calendarEvents.filter((e) => e.category === 'Exams')) {
      if (isPastDate(ev.date)) continue
      items.push({
        id: `e-${ev.id}`,
        title: ev.title,
        meta: `Assessment · ${formatDueLabel(ev.date)}`,
        kind: 'assessment',
        date: parseFlexibleDate(ev.date),
        onOpen: () => push('upcoming'),
      })
    }
    return items.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0)).slice(0, 4)
  }, [timetableByDay, pending, calendarEvents, push])

  return (
    <div className="space-y-6 pb-8">
      <HeroBanner title="Learn" subtitle="Your learning journey, made simple." artSrc="/art/hero-learn.svg" />

      {continueTask || continueChapter ? (
        <div
          className="o-card relative overflow-hidden space-y-3 p-4"
          style={{ background: 'linear-gradient(135deg, var(--o-sci-from), var(--o-surface))' }}
        >
          <img
            src="/art/plant.svg"
            alt=""
            className="pointer-events-none absolute right-0 top-2 h-28 opacity-45"
            aria-hidden
          />
          <TagChip
            label={continueTask?.subject ?? continueChapter?.subject ?? 'Subject'}
            tone={subjectTone(continueTask?.subject ?? continueChapter?.subject ?? 'science')}
          />
          <p className="relative font-display text-base font-bold text-o-text">
            {continueTask?.task ?? continueChapter?.title}
          </p>
          <p className="relative text-[12px] text-o-muted">
            {continueTask
              ? `${continueTask.subject} · ~${taskMinutes(continueTask)} min · Due ${formatDueLabel(continueTask.due)}`
              : 'Topic in progress'}
          </p>
          <ProgressBar
            value={continuePct}
            accent={subjectAccent(continueTask?.subject ?? 'science')}
            label="Coverage"
            height={6}
          />
          <SaPrimaryButton
            onClick={() => {
              if (continueTask) {
                push('homework', { subject: continueTask.subject, taskId: continueTask.id }, 'Homework')
                return
              }
              if (continueChapter)
                push('subject', { subject: continueChapter.subject }, continueChapter.subject)
            }}
          >
            Continue <Arrow className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </SaPrimaryButton>
        </div>
      ) : (
        <EmptyState
          art="/art/caught-up.svg"
          title="You're caught up"
          body="Pick a subject or try a quick quiz when you're ready."
          action={
            <SaPrimaryButton onClick={() => push('gk-quiz')}>
              Try a quiz <Arrow className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </SaPrimaryButton>
          }
        />
      )}

      <SaSection eyebrow="Your subjects" action={<SaViewAll onClick={() => push('syllabus')} />}>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [scroll-padding-left:20px] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
          {subjectMeta.map(({ subject, avg }) => (
            <button
              key={subject}
              type="button"
              onClick={() => push('subject', { subject }, subject)}
              className="o-focus snap-start flex w-[132px] shrink-0 flex-col gap-3 rounded-card border border-o-border p-3 text-left active:scale-[0.98]"
              style={{ background: subjectCardGradient(subject) }}
            >
              <IconTile
                {...(subjectTone(subject) === 'math' ? { glyph: 'π' } : { icon: subjectIcon(subject) })}
                tone={subjectTone(subject)}
                size="lg"
              />
              <span className="font-display text-[15px] font-bold text-o-text">{subject}</span>
              <span className="text-[11px] text-o-muted">{avg}% covered</span>
              <ProgressBar
                value={avg}
                accent={subjectAccent(subject)}
                height={4}
                label={`${subject} coverage`}
              />
              <span className="ml-auto inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-black/25">
                <Arrow className="h-3.5 w-3.5 text-white" strokeWidth={1.75} aria-hidden />
              </span>
            </button>
          ))}
        </div>
      </SaSection>

      <SaSection eyebrow="Upcoming" action={<SaViewAll onClick={() => push('upcoming')} />}>
        {upcomingPreview.length === 0 ? (
          <EmptyState
            compact
            art="/art/caught-up.svg"
            title="Nothing upcoming"
            body="New classes and homework will show here."
          />
        ) : (
          <div className="o-card divide-y divide-o-border p-1">
            {upcomingPreview.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onOpen}
                className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left active:scale-[0.98]"
              >
                <IconTile icon={ICON.item[item.kind]} tone={TONE_BY_ITEM_TYPE[item.kind]} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-o-text">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[12px] text-o-muted">{item.meta}</span>
                </span>
                {item.date ? <DateChip date={item.date} /> : null}
                <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
              </button>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Study tools">
        <div className="grid grid-cols-3 gap-3">
          {TOOLS.map(({ title, hint, icon, tone, dest }) => (
            <button
              key={title}
              type="button"
              onClick={() => push(dest)}
              className="o-card o-focus flex flex-col items-start gap-2 p-3 text-left active:scale-[0.98]"
            >
              <IconTile icon={icon} tone={tone} size="md" />
              <span className="text-[13.5px] font-semibold text-o-text">{title}</span>
              <span className="text-[11.5px] text-o-muted">{hint}</span>
            </button>
          ))}
        </div>
      </SaSection>
    </div>
  )
}
