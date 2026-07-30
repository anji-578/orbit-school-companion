import { CalendarDays } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card } from '../../components/ui/primitives'
import type { CalendarEvent } from '../../types'

const CATEGORY_CLASS: Record<CalendarEvent['category'], string> = {
  Exams: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Holidays: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'PTA Meetings': 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Extracurricular: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
}

/** Read-only school calendar for student & parent personas. */
export function CalendarView() {
  const lang = useOrbitStore((s) => s.lang)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const t = (key: string) => translate(lang, key)

  return (
    <Panel title={t('sharedCalendarTitle')} subtitle={t('sharedCalendarDesc')}>
      <div className="space-y-2.5">
        {calendarEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">{t('noCalendarEvents')}</p>
        ) : (
          calendarEvents.map((event) => (
            <Card key={event.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CalendarDays className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{event.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{event.date}</p>
                </div>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${CATEGORY_CLASS[event.category]}`}
              >
                {event.category}
              </span>
            </Card>
          ))
        )}
      </div>
    </Panel>
  )
}
