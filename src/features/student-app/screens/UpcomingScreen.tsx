import { useMemo } from 'react'
import { CalendarDays, CheckSquare, ClipboardList } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { SaCard, SaRow, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

function dueUrgency(due: string): number {
  const d = due.toLowerCase()
  if (d.includes('tomorrow') || d.includes('today')) return 0
  if (d.includes('2 day')) return 1
  return 2
}

/** Learn → Upcoming: classes, homework, calendar — not a tool directory. */
export function UpcomingScreen() {
  const { push } = useStudentNav()
  const tasks = useOrbitStore((s) => s.tasks)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)

  const pending = useMemo(
    () =>
      [...tasks.filter((t) => !t.completed)].sort((a, b) => dueUrgency(a.due) - dueUrgency(b.due)).slice(0, 6),
    [tasks],
  )

  const todayClasses = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]).filter((c) => c.status !== 'Completed'),
    [timetableByDay],
  )

  const soonEvents = useMemo(() => calendarEvents.slice(0, 4), [calendarEvents])

  return (
    <div className="space-y-5 pb-4">
      <SaSection eyebrow="Classes">
        {todayClasses.length === 0 ? (
          <SaCard className="p-4">
            <p className="text-xs text-[var(--muted)]">No more classes today.</p>
          </SaCard>
        ) : (
          <div className="space-y-2">
            {todayClasses.map((c) => (
              <SaRow
                key={`${c.name}-${c.time}`}
                icon={ClipboardList}
                title={c.name}
                subtitle={c.time}
                onClick={() => push('schedule')}
              />
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Homework">
        {pending.length === 0 ? (
          <SaCard className="p-4">
            <p className="text-xs text-[var(--muted)]">No open homework — nice work.</p>
          </SaCard>
        ) : (
          <div className="space-y-2">
            {pending.map((t) => (
              <SaRow
                key={t.id}
                icon={CheckSquare}
                title={t.task}
                subtitle={`${t.subject} · Due ${t.due}`}
                onClick={() => push('homework', { subject: t.subject, taskId: t.id })}
              />
            ))}
          </div>
        )}
      </SaSection>

      <SaSection
        eyebrow="Calendar"
        action={
          <button type="button" className="text-[10px] font-bold text-[var(--accent)]" onClick={() => push('calendar')}>
            Full calendar →
          </button>
        }
      >
        {soonEvents.length === 0 ? (
          <SaCard className="p-4">
            <p className="text-xs text-[var(--muted)]">No upcoming school events.</p>
          </SaCard>
        ) : (
          <div className="space-y-2">
            {soonEvents.map((ev) => (
              <SaRow
                key={ev.id}
                icon={CalendarDays}
                title={ev.title}
                subtitle={`${ev.date} · ${ev.category}`}
                onClick={() => push('calendar')}
              />
            ))}
          </div>
        )}
      </SaSection>
    </div>
  )
}
