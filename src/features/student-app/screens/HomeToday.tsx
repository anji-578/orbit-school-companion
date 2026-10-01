import { useMemo } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock3,
  Flame,
  Gamepad2,
  MapPin,
  Target,
} from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childDisplayName } from '../../../lib/linkedStudent'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { InviteRedeemCard } from '../../../components/ui/InviteRedeemCard'
import { useStudentNav } from '../StudentNavContext'
import { presentStreak } from '@/domain/streak/present-streak'
import { selectUrgentHomework, taskMinutes } from '@/domain/priority/homework-priority'
import { SaPrimaryButton, SaSection, SaViewAll } from '../components/SaUi'
import { subjectTheme } from '../subjectTheme'

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

export function HomeToday() {
  const { push, openAskOrbit } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const tasks = useOrbitStore((s) => s.tasks)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
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
  const openHw = tasks.filter((t) => !t.completed).length
  const classesToday = timeline.length
  const assessments = calendarEvents.filter((e) => e.category === 'Exams').length
  const nextTheme = nextLive ? subjectTheme(nextLive.name) : subjectTheme('Math')

  const todayItems = useMemo(() => {
    type Item = {
      id: string
      done: boolean
      title: string
      meta: string
      badge: string
      badgeTone: string
      onOpen: () => void
    }
    const items: Item[] = []
    for (const period of timeline.filter((p) => p.status !== 'Completed').slice(0, 2)) {
      items.push({
        id: `class-${period.name}-${period.time}`,
        done: false,
        title: `${period.name} class`,
        meta: period.time,
        badge: 'CLASS',
        badgeTone: 'bg-blue-500/15 text-blue-300',
        onOpen: () => push('subject', { subject: period.name }, period.name),
      })
    }
    for (const t of tasks.filter((x) => !x.completed).slice(0, 2)) {
      items.push({
        id: `hw-${t.id}`,
        done: false,
        title: t.task,
        meta: `${t.subject} · Due ${t.due}`,
        badge: 'HOMEWORK',
        badgeTone: 'bg-emerald-500/15 text-emerald-300',
        onOpen: () => push('homework', { subject: t.subject, taskId: t.id }, 'Homework'),
      })
    }
    return items.slice(0, 3)
  }, [tasks, timeline, push])

  const stats = [
    { icon: ClipboardList, value: openHw, label: 'Homework to complete', tone: 'text-rose-400', go: () => push('upcoming') },
    { icon: BookOpen, value: classesToday, label: 'Classes today', tone: 'text-orbit-primary', go: () => push('schedule') },
    { icon: CalendarDays, value: assessments, label: 'Assessment upcoming', tone: 'text-amber-400', go: () => push('assessments') },
    { icon: Flame, value: streak, label: 'Day streak', tone: 'text-violet-400', go: () => push('school-records') },
  ]

  return (
    <div className="space-y-6 pb-8">
      {!classLinked ? <InviteRedeemCard /> : null}

      <header className="relative overflow-hidden rounded-card border border-white/[0.08] bg-orbit-surface">
        <img
          src="/brand/orbit-home-hero.jpg"
          alt=""
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[48%] object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orbit-surface via-orbit-surface/90 to-transparent" />
        <div className="relative space-y-2 p-4 pr-[42%]">
          <p className="font-heading text-[1.55rem] font-bold leading-tight text-white">
            {greeting()}
            <br />
            {name}
          </p>
          <p className="text-[13px] leading-snug text-orbit-text-secondary">
            A new day to learn, grow and do something amazing!
          </p>
        </div>
      </header>

      <SaSection eyebrow="Next class">
        <div className="orbit-card relative overflow-hidden">
          <img
            src="/brand/student-motivation-banner.png"
            alt=""
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-28 object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orbit-surface via-orbit-surface/95 to-orbit-surface/40" />
          <div className="relative space-y-3">
            <div className="flex items-start justify-between gap-2">
              <span className="orbit-eyebrow">Next class</span>
              <span className="rounded-full bg-orbit-primary/20 px-2.5 py-1 text-[10px] font-bold tracking-wide text-orbit-accent">
                CLASS
              </span>
            </div>
            {nextLive ? (
              <>
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-icon text-lg font-bold text-white"
                    style={{ background: nextTheme.accent }}
                  >
                    {nextTheme.label || nextLive.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-base font-bold text-white">{nextLive.name}</p>
                    <p className="mt-0.5 text-[13px] text-orbit-text-secondary">Ready when you are</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-orbit-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        {nextLive.time}
                        {classInMins != null && classInMins >= 0 ? ` · in ${classInMins} min` : ''}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        Online class
                      </span>
                    </div>
                  </div>
                </div>
                <SaPrimaryButton onClick={() => openAskOrbit(`Help me get ready for ${nextLive.name}.`)}>
                  Get ready <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </SaPrimaryButton>
              </>
            ) : (
              <p className="text-sm text-orbit-text-secondary">No more classes today — nice work.</p>
            )}
          </div>
        </div>
      </SaSection>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, value, label, tone, go }) => (
          <button key={label} type="button" onClick={go} className="orbit-card-interactive flex items-start gap-2.5 text-left">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-xl font-bold leading-none text-white">{value}</span>
              <span className="mt-1 block text-[11px] leading-snug text-orbit-text-secondary">{label}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
          </button>
        ))}
      </div>

      <SaSection eyebrow="Your priority">
        <div className="orbit-card relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-[#0B2A22] to-[#091715]">
          {urgentHw ? (
            <div className="relative space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-icon bg-emerald-500/20">
                  <Target className="h-5 w-5 text-emerald-400" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-base font-bold text-white">Finish the worksheet</p>
                  <p className="mt-0.5 text-[13px] text-orbit-text-secondary">
                    {urgentHw.subject} · {urgentHw.task}
                  </p>
                  <p className="mt-2 text-[11px] text-orbit-text-muted">
                    ~{taskMinutes(urgentHw)} min · Due {urgentHw.due}
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-emerald-400/40 text-center">
                  <span className="text-xs font-bold text-white">{urgentHw.started ? '1/2' : '0/1'}</span>
                </div>
              </div>
              <SaPrimaryButton
                onClick={() => {
                  const taskId = Number(urgentHw.id)
                  if (!urgentHw.started && Number.isFinite(taskId)) {
                    startTask(taskId)
                    triggerToast('Homework started')
                  }
                  push('homework', { subject: urgentHw.subject, taskId: urgentHw.id }, 'Homework')
                }}
              >
                Continue <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </SaPrimaryButton>
            </div>
          ) : (
            <p className="text-sm text-orbit-text-secondary">Nothing urgent — you&apos;re clear for now.</p>
          )}
        </div>
      </SaSection>

      <SaSection
        eyebrow="Today's to-do"
        action={<SaViewAll label={`View all (${todayItems.length}) →`} onClick={() => push('upcoming')} />}
      >
        <div className="orbit-card space-y-1 p-2">
          {todayItems.length === 0 ? (
            <p className="px-2 py-3 text-sm text-orbit-text-secondary">Nothing left for today.</p>
          ) : (
            todayItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onOpen}
                className="flex w-full items-center gap-3 rounded-icon px-2 py-3 text-left transition hover:bg-white/[0.03]"
              >
                <Circle className="h-[18px] w-[18px] shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-orbit-text-secondary">{item.meta}</span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide ${item.badgeTone}`}>
                  {item.badge}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
              </button>
            ))
          )}
        </div>
      </SaSection>

      <div className="orbit-card flex items-center gap-3 border-violet-500/25 bg-gradient-to-r from-[#1C1438] to-[#0E172C]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-icon bg-violet-500/20">
          <Gamepad2 className="h-5 w-5 text-violet-300" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">You&apos;re all caught up!</p>
          <p className="mt-0.5 text-[11px] text-orbit-text-secondary">Want to try a quick quiz or explore something new?</p>
        </div>
        <button type="button" onClick={() => push('gk-quiz')} className="orbit-btn-primary shrink-0 px-3 py-2 text-xs">
          Try a quiz <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  )
}
