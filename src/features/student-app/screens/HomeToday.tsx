import { useMemo } from 'react'
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckSquare,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Flame,
  Gamepad2,
  MapPin,
  Target,
  Trophy,
  User,
  FlaskConical,
} from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childDisplayName } from '../../../lib/linkedStudent'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { InviteRedeemCard } from '../../../components/ui/InviteRedeemCard'
import { chapterProgress } from '../../../store/orbitHelpers'
import type { HomeworkTask } from '../../../types'
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

function subjectGlyph(subject: string): string {
  const s = subject.toLowerCase()
  if (s.includes('math')) return 'π'
  if (s.includes('chem')) return 'C'
  if (s.includes('sci') || s.includes('bio') || s.includes('physics')) return 'S'
  if (s.includes('eng')) return 'Aa'
  return subject.slice(0, 1).toUpperCase()
}

function ProgressRing({ value, total, label }: { value: number; total: number; label: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#34d399"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">{label}</span>
    </div>
  )
}

/** Home — premium daily briefing matching Orbit product mock. */
export function HomeToday() {
  const { push, openAskOrbit, setTab } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const tasks = useOrbitStore((s) => s.tasks)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const teachers = useOrbitStore((s) => s.teachers)
  const startTask = useOrbitStore((s) => s.startTask)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

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

  const nextTopic = useMemo(() => {
    if (!nextLive) return null
    const chapter = curriculum.find(
      (c) => c.subject.toLowerCase() === nextLive.name.toLowerCase() && chapterProgress(c) < 100,
    )
    return chapter?.title ?? null
  }, [nextLive, curriculum])

  const assessmentsUpcoming = useMemo(
    () => calendarEvents.filter((e) => e.category === 'Exams').length,
    [calendarEvents],
  )

  const teacherForHw = useMemo(() => {
    if (!urgentHw) return null
    const match = teachers.find((t) =>
      (t.subjectKey || '').toLowerCase().includes(urgentHw.subject.toLowerCase().slice(0, 4)),
    )
    return match?.name ?? teachers[0]?.name ?? null
  }, [urgentHw, teachers])

  const hwProgress = useMemo(() => {
    if (!urgentHw) return { done: 0, total: 8 }
    const mins = taskMinutes(urgentHw)
    const total = Math.max(4, Math.round(mins / 5))
    const done = urgentHw.started ? Math.max(1, Math.round(total * 0.25)) : 0
    return { done, total }
  }, [urgentHw])

  const todoItems = useMemo(() => {
    type Todo = {
      id: string
      title: string
      subtitle: string
      kind: 'CLASS' | 'HOMEWORK' | 'STUDY'
      onOpen: () => void
    }
    const items: Todo[] = []
    for (const period of timeline.filter((p) => p.status !== 'Completed').slice(0, 2)) {
      items.push({
        id: `class-${period.id}`,
        title: `${period.name} class`,
        subtitle: period.time + (period.room ? ` · ${period.room}` : ''),
        kind: 'CLASS',
        onOpen: () => push('subject', { subject: period.name }, period.name),
      })
    }
    for (const t of pending.slice(0, 2)) {
      items.push({
        id: `hw-${t.id}`,
        title: t.task,
        subtitle: t.subject,
        kind: 'HOMEWORK',
        onOpen: () => push('homework', { subject: t.subject, taskId: t.id }, 'Homework'),
      })
    }
    if (items.length < 3 && nextTopic && nextLive) {
      items.push({
        id: 'study-revise',
        title: `Revise ${nextTopic.split(' ').slice(0, 3).join(' ')}`,
        subtitle: nextLive.name,
        kind: 'STUDY',
        onOpen: () => openAskOrbit(`Help me revise ${nextTopic} for ${nextLive.name}.`),
      })
    }
    return items.slice(0, 3)
  }, [timeline, pending, nextTopic, nextLive, push, openAskOrbit])

  const classesToday = timeline.length

  return (
    <div className="home-premium space-y-4 pb-8 -mx-1 px-1">
      {!classLinked ? <InviteRedeemCard /> : null}

      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-[1.6rem] min-h-[148px] px-4 py-4">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(120% 90% at 90% 20%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(80% 70% at 10% 90%, rgba(99,102,241,0.18), transparent 50%), linear-gradient(135deg, #0b1224 0%, #121a33 100%)',
          }}
        />
        <img
          src="/brand/orbit-home-hero.jpg"
          alt=""
          className="absolute right-0 top-0 h-full w-[48%] object-cover object-center pointer-events-none select-none mask-home-hero"
        />
        <div className="relative z-[1] max-w-[58%] space-y-1.5">
          <p className="text-[12px] font-semibold text-slate-300">{greeting()},</p>
          <h1 className="font-display text-[1.65rem] leading-tight font-extrabold text-white tracking-tight">
            {name} <span aria-hidden>👋</span>
          </h1>
          <p className="text-[12px] leading-relaxed text-slate-300/90">
            A new day to learn, grow and do something amazing!
          </p>
        </div>
      </section>

      {/* Next class */}
      <section
        className="relative overflow-hidden rounded-[1.5rem] border border-white/10 p-4 text-white"
        style={{
          background:
            'linear-gradient(145deg, #1a2a6c 0%, #243b8a 45%, #1e3a8a 70%, #152456 100%)',
          boxShadow: '0 18px 40px -20px rgba(37,99,235,0.55)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200/80">Next class</p>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/25">
            Class
          </span>
        </div>
        {nextLive ? (
          <>
            <div className="flex items-start gap-3 pr-16">
              <span className="h-12 w-12 rounded-2xl bg-[#2563eb] flex items-center justify-center text-lg font-black shadow-lg shadow-blue-900/40 shrink-0">
                {subjectGlyph(nextLive.name)}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-extrabold leading-snug">{nextLive.name}</p>
                <p className="text-sm text-sky-100/80 mt-0.5 truncate">{nextTopic || 'Class period'}</p>
                <div className="mt-2.5 space-y-1 text-[11px] text-sky-100/75">
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {nextLive.time}
                    {classInMins != null && classInMins >= 0 ? ` · in ${classInMins} min` : ''}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {nextLive.room || 'Online Class'}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAskOrbit(`Help me get ready for ${nextLive.name}${nextTopic ? `: ${nextTopic}` : ''}.`)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30"
            >
              Get ready
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
            <div
              className="pointer-events-none absolute -right-2 bottom-0 h-24 w-28 opacity-40"
              aria-hidden
              style={{
                background:
                  'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.25), transparent 65%)',
              }}
            />
          </>
        ) : (
          <p className="text-sm text-sky-100/80 py-2">No more classes today — nice work.</p>
        )}
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-4 gap-2">
        <StatTile
          icon={CheckSquare}
          tone="rose"
          value={pending.length}
          label="Homework to complete"
          onClick={() => push('upcoming')}
        />
        <StatTile
          icon={Camera}
          tone="sky"
          value={classesToday}
          label="Classes today"
          onClick={() => push('schedule')}
        />
        <StatTile
          icon={FileText}
          tone="amber"
          value={assessmentsUpcoming}
          label="Assessment upcoming"
          onClick={() => push('calendar')}
        />
        <StatTile
          icon={Trophy}
          tone="violet"
          value={streak}
          label="Day streak"
          onClick={() => push('school-records')}
        />
      </section>

      {/* Priority */}
      {urgentHw ? (
        <section
          className="relative overflow-hidden rounded-[1.5rem] border border-emerald-400/20 p-4"
          style={{
            background:
              'linear-gradient(120deg, rgba(6,78,59,0.92) 0%, rgba(4,47,46,0.95) 55%, rgba(15,23,42,0.9) 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 80% 20%, rgba(52,211,153,0.35), transparent 50%), radial-gradient(ellipse at 10% 90%, rgba(16,185,129,0.2), transparent 45%)',
            }}
          />
          <p className="relative text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/80 mb-3">
            Your priority
          </p>
          <div className="relative flex gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="h-9 w-9 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <Target className="h-4 w-4 text-emerald-300" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-white leading-snug">{urgentHw.task}</p>
                  <p className="text-[12px] text-emerald-100/75 mt-0.5">{urgentHw.subject}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-emerald-100/70">
                <span className="inline-flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" aria-hidden />
                  {hwProgress.total} steps
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  Due {urgentHw.due}
                </span>
                {teacherForHw ? (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" aria-hidden />
                    {teacherForHw}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!urgentHw.started) {
                    startTask(urgentHw.id)
                    triggerToast('Homework started')
                  }
                  push('homework', { subject: urgentHw.subject, taskId: urgentHw.id }, 'Homework')
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-2.5 text-xs font-bold text-white"
              >
                {urgentHw.started ? 'Continue' : 'Start'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <ProgressRing
              value={hwProgress.done}
              total={hwProgress.total}
              label={`${hwProgress.done}/${hwProgress.total}`}
            />
          </div>
        </section>
      ) : null}

      {/* Today's to-do */}
      <section
        className="rounded-[1.4rem] border border-white/10 overflow-hidden"
        style={{ background: 'color-mix(in srgb, var(--panel) 88%, #0b1224)' }}
      >
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Today&apos;s to-do</p>
          <button
            type="button"
            className="text-[11px] font-bold text-sky-400"
            onClick={() => push('upcoming')}
          >
            View all ({Math.max(todoItems.length, pending.length + timeline.filter((t) => t.status !== 'Completed').length)}) →
          </button>
        </div>
        {todoItems.length === 0 ? (
          <p className="px-4 pb-4 text-xs text-[var(--muted)]">Nothing open for today.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {todoItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onOpen}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <Circle className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <span
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.kind === 'CLASS'
                        ? 'bg-sky-500/15 text-sky-400'
                        : item.kind === 'HOMEWORK'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-violet-500/15 text-violet-400'
                    }`}
                  >
                    {item.kind === 'CLASS' ? (
                      <BookOpen className="h-4 w-4" aria-hidden />
                    ) : item.kind === 'HOMEWORK' ? (
                      <FileText className="h-4 w-4" aria-hidden />
                    ) : (
                      <FlaskConical className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--fg)] truncate">{item.title}</span>
                    <span className="block text-[11px] text-[var(--muted)] truncate">{item.subtitle}</span>
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full border shrink-0 ${
                      item.kind === 'CLASS'
                        ? 'bg-sky-500/15 text-sky-300 border-sky-400/25'
                        : item.kind === 'HOMEWORK'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25'
                          : 'bg-violet-500/15 text-violet-300 border-violet-400/25'
                    }`}
                  >
                    {item.kind}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Caught up / quiz CTA */}
      <section
        className="rounded-[1.4rem] border border-violet-400/20 p-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(120deg, #2e1065 0%, #1e1b4b 55%, #0f172a 100%)',
        }}
      >
        <span className="h-11 w-11 rounded-2xl bg-violet-500/25 flex items-center justify-center shrink-0">
          {pending.length === 0 ? (
            <Gamepad2 className="h-5 w-5 text-violet-300" aria-hidden />
          ) : (
            <Flame className="h-5 w-5 text-violet-300" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-white">
            {pending.length === 0 ? "You're all caught up! 🥳" : 'Keep the momentum'}
          </p>
          <p className="text-[11px] text-violet-100/70 mt-0.5">
            {pending.length === 0
              ? 'Want to try a quick quiz or explore something new?'
              : 'Finish priority work, then try a challenge in Grow.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (pending.length === 0 ? push('gk-quiz') : setTab('grow'))}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-3.5 py-2.5 text-[11px] font-bold text-white"
        >
          {pending.length === 0 ? 'Try a quiz' : 'Explore'}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </section>
    </div>
  )
}

function StatTile({
  icon: Icon,
  tone,
  value,
  label,
  onClick,
}: {
  icon: typeof BookOpen
  tone: 'rose' | 'sky' | 'amber' | 'violet'
  value: number
  label: string
  onClick: () => void
}) {
  const tones = {
    rose: 'text-rose-400 bg-rose-500/15',
    sky: 'text-sky-400 bg-sky-500/15',
    amber: 'text-amber-400 bg-amber-500/15',
    violet: 'text-violet-400 bg-violet-500/15',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/10 p-2.5 text-left min-h-[88px] flex flex-col gap-1.5"
      style={{ background: 'color-mix(in srgb, var(--panel) 80%, #0b1224)' }}
    >
      <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${tones[tone]}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="text-lg font-black text-[var(--fg)] leading-none">{value}</span>
      <span className="text-[9px] font-semibold text-[var(--muted)] leading-tight">{label}</span>
    </button>
  )
}
