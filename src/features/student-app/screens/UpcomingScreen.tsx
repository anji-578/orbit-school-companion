import { useMemo } from 'react'
import { CalendarDays, CheckSquare, ClipboardList } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { SaRow, SaSection } from '../components/SaUi'
import { SaEmpty } from '../components/NestedChrome'
import { useStudentNav } from '../StudentNavContext'

function dueUrgency(due: string): number {
  const d = due.toLowerCase()
  if (d.includes('tomorrow') || d.includes('today')) return 0
  if (d.includes('2 day')) return 1
  return 2
}

/** Learn → Upcoming: classes, homework, calendar. */
export function UpcomingScreen() {
  const { push } = useStudentNav()
  const tasks = useOrbitStore((s) => s.tasks)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)

  const pending = useMemo(
    () =>
      [...tasks.filter((t) => !t.completed)].sort((a, b) => dueUrgency(a.due) - dueUrgency(b.due)).slice(0, 8),
    [tasks],
  )

  const todayClasses = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]).filter((c) => c.status !== 'Completed'),
    [timetableByDay],
  )

  const soonEvents = useMemo(() => calendarEvents.slice(0, 5), [calendarEvents])

  return (
    <div className="space-y-5 pb-6">
      <SaSection eyebrow="Classes">
        {todayClasses.length === 0 ? (
          <SaEmpty title="No more classes today" body="Enjoy the break — or jump into homework." />
        ) : (
          <div className="space-y-2">
            {todayClasses.map((c) => (
              <SaRow
                key={`${c.name}-${c.time}`}
                icon={ClipboardList}
                title={c.name}
                subtitle={c.time}
                onClick={() => push('subject', { subject: c.name }, c.name)}
              />
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Homework">
        {pending.length === 0 ? (
          <SaEmpty title="No open homework" body="You're clear — revisit a subject if you want extra practice." />
        ) : (
          <div className="space-y-2">
            {pending.map((t) => (
              <SaRow
                key={t.id}
                icon={CheckSquare}
                title={t.task}
                subtitle={`${t.subject} · Due ${t.due}`}
                onClick={() => push('homework', { subject: t.subject, taskId: t.id }, 'Homework')}
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
          <SaEmpty title="No upcoming events" body="School events and exams will list here." />
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
