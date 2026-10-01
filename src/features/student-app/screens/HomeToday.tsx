import { useMemo } from 'react'
import { InviteRedeemCard } from '../../../components/ui/InviteRedeemCard'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childDisplayName } from '../../../lib/linkedStudent'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { useStudentNav } from '../StudentNavContext'
import { presentStreak } from '@/domain/streak/present-streak'
import { selectUrgentHomework, taskMinutes } from '@/domain/priority/homework-priority'
import { SaPrimaryButton, SaSection, SaViewAll } from '../components/SaUi'
import {
  EmptyState,
  FloatingChip,
  HeroBanner,
  ICON,
  IconTile,
  ProgressRing,
  StatTile,
  TagChip,
  subjectIcon,
  subjectTone,
} from '@/shared/ui/orbit'

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
  const timeline = useMemo(() => deriveTodayTimeline(timetableByDay[currentDayCode()]), [timetableByDay])
  const nextLive = timeline.find((item) => item.status !== 'Completed')
  const classInMins = nextLive ? minutesUntilAmPm(nextLive.time) : null
  const urgentHw = useMemo(() => selectUrgentHomework(tasks), [tasks])
  const openHw = tasks.filter((t) => !t.completed).length
  const Arrow = ICON.chrome.arrow
  const Time = ICON.meta.time
  const Place = ICON.meta.place
  const Target = ICON.grow.skills

  const todayItems = useMemo(() => {
    type Item = {
      id: string
      done: boolean
      title: string
      meta: string
      kind: 'class' | 'homework' | 'study'
      onOpen: () => void
    }
    const items: Item[] = []
    for (const period of timeline.filter((p) => p.status !== 'Completed').slice(0, 2)) {
      items.push({
        id: `class-${period.name}-${period.time}`,
        done: false,
        title: `${period.name} class`,
        meta: period.time,
        kind: 'class',
        onOpen: () => push('subject', { subject: period.name }, period.name),
      })
    }
    for (const t of tasks.filter((x) => !x.completed).slice(0, 2)) {
      items.push({
        id: `hw-${t.id}`,
        done: false,
        title: t.task,
        meta: `${t.subject} · Due ${t.due}`,
        kind: 'homework',
        onOpen: () => push('homework', { subject: t.subject, taskId: t.id }, 'Homework'),
      })
    }
    return items.slice(0, 3)
  }, [tasks, timeline, push])

  return (
    <div className="space-y-6 pb-8">
      {!classLinked ? <InviteRedeemCard /> : null}

      <HeroBanner
        eyebrow={greeting()}
        title={`${name} 👋`}
        subtitle="A new day to learn, grow and do something amazing!"
        artSrc="/art/hero-home.svg"
        chips={
          <div className="pointer-events-none absolute right-2 top-16 flex flex-col gap-2">
            <FloatingChip icon={ICON.tab.learn} line1="Learn" line2="Today" tone="blue" rotate={-7} />
            <FloatingChip icon={ICON.tab.grow} line1="Grow" line2="Explore" tone="green" rotate={6} />
            <FloatingChip icon={ICON.tool.askOrbit} line1="Be" line2="You" tone="purple" rotate={5} />
          </div>
        }
      />

      {nextLive ? (
        <SaSection eyebrow="Next class" first>
          <div className="o-card relative overflow-hidden p-4">
            <img
              src="/art/hero-learn.svg"
              alt=""
              width={120}
              height={90}
              className="pointer-events-none absolute -right-2 bottom-0 h-24 w-auto opacity-40"
              aria-hidden
            />
            <div className="relative space-y-3">
              <div className="flex justify-end">
                <TagChip label="CLASS" tone="blue" />
              </div>
              <div className="flex items-start gap-3">
                <IconTile
                  {...(subjectTone(nextLive.name) === 'math'
                    ? { glyph: 'π' }
                    : { icon: subjectIcon(nextLive.name) })}
                  tone={subjectTone(nextLive.name)}
                  size="xl"
                  label={nextLive.name}
                />
                <div className="min-w-0">
                  <p className="font-display text-[20px] font-bold text-o-text">{nextLive.name}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-o-muted">
                    <span className="inline-flex items-center gap-1">
                      <Time className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      {nextLive.time}
                      {classInMins != null && classInMins >= 0 ? ` · in ${classInMins} min` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Place className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                      Online class
                    </span>
                  </div>
                </div>
              </div>
              <SaPrimaryButton onClick={() => openAskOrbit(`Help me get ready for ${nextLive.name}.`)}>
                Get ready <Arrow className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </SaPrimaryButton>
            </div>
          </div>
        </SaSection>
      ) : null}

      <div className="flex gap-2">
        <StatTile
          icon={ICON.stat.homework}
          tone="red"
          value={openHw}
          label="Homework to complete"
          onClick={() => push('upcoming')}
        />
        <StatTile
          icon={ICON.stat.classes}
          tone="blue"
          value={timeline.length}
          label="Classes today"
          onClick={() => push('schedule')}
        />
        <StatTile
          icon={ICON.stat.assessment}
          tone="amber"
          value={calendarEvents.filter((e) => e.category === 'Exams').length}
          label="Assessment upcoming"
          onClick={() => push('assessments')}
        />
        <StatTile
          icon={ICON.stat.streak}
          tone="purple"
          value={streak}
          label="Day streak"
          onClick={() => push('school-records')}
        />
      </div>

      <SaSection eyebrow="Your priority">
        {urgentHw ? (
          <div
            className="o-card relative overflow-hidden border-[color-mix(in_srgb,var(--o-sci-accent)_28%,transparent)] p-4"
            style={{ background: 'linear-gradient(135deg, var(--o-sci-from), var(--o-sci-to))' }}
          >
            <img
              src="/art/plant.svg"
              alt=""
              className="pointer-events-none absolute right-0 top-0 h-full w-[55%] object-contain opacity-50"
              style={{ maskImage: 'linear-gradient(90deg,transparent,#000)' }}
              aria-hidden
            />
            <div className="relative flex items-start gap-3">
              <IconTile icon={Target} tone="green" size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[19px] font-bold text-o-text">Finish the worksheet</p>
                <p className="mt-1 text-[13px] text-o-muted">
                  {urgentHw.subject} · {urgentHw.task}
                </p>
                <p className="mt-2 text-[12px] text-o-muted">
                  ~{taskMinutes(urgentHw)} min · Due {urgentHw.due}
                </p>
              </div>
              <ProgressRing value={urgentHw.started ? 1 : 0} total={1} size={56} label="Progress" />
            </div>
            <div className="relative mt-3">
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
                Continue <Arrow className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </SaPrimaryButton>
            </div>
          </div>
        ) : (
          <EmptyState
            art="/art/caught-up.svg"
            title="You're all caught up!"
            body="Want to try a quick quiz or explore something new?"
            action={
              <SaPrimaryButton onClick={() => push('gk-quiz')}>
                Try a quiz <Arrow className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </SaPrimaryButton>
            }
          />
        )}
      </SaSection>

      <SaSection
        eyebrow="Today's to-do"
        action={<SaViewAll label={`View all (${todayItems.length})`} onClick={() => push('upcoming')} />}
      >
        <div className="o-card divide-y divide-o-border p-1">
          {todayItems.length === 0 ? (
            <p className="px-3 py-4 text-sm text-o-muted">Nothing left for today.</p>
          ) : (
            todayItems.map((item) => {
              const tone = item.kind === 'class' ? 'blue' : item.kind === 'homework' ? 'green' : 'purple'
              const ItemIcon = ICON.item[item.kind]
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onOpen}
                  className="o-focus flex min-h-[60px] w-full items-center gap-3 px-3 py-2.5 text-left active:scale-[0.98]"
                >
                  <span className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-o-border-strong" />
                  <IconTile icon={ItemIcon} tone={tone} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-o-text">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-o-muted">{item.meta}</span>
                  </span>
                  <TagChip label={item.kind.toUpperCase()} tone={tone} />
                </button>
              )
            })
          )}
        </div>
      </SaSection>
    </div>
  )
}
