import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarPlus, CalendarDays } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card } from '../../components/ui/primitives'
import type { CalendarEvent } from '../../types'

const CATEGORIES: CalendarEvent['category'][] = ['Exams', 'Holidays', 'PTA Meetings', 'Extracurricular']

const CATEGORY_CLASS: Record<CalendarEvent['category'], string> = {
  Exams: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Holidays: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'PTA Meetings': 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  Extracurricular: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
}

export function SchoolCalendar() {
  const lang = useOrbitStore((s) => s.lang)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const addCalendarEvent = useOrbitStore((s) => s.addCalendarEvent)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CalendarEvent['category']>('Exams')
  const [date, setDate] = useState('')

  const t = (key: string) => translate(lang, key)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date.trim()) return
    addCalendarEvent(title, category, date)
    setTitle('')
    setDate('')
  }

  return (
    <div className="space-y-6">
      <Panel title={t('schoolCalendarTitle')} subtitle={t('schoolCalendarDesc')}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end">
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Event title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Fair"
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CalendarEvent['category'])}
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0D1120]">
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. August 10, 2026"
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            className="btn-accent flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
            {t('addEvent')}
          </button>
        </form>
      </Panel>

      <Panel title="Upcoming Events">
        <div className="grid sm:grid-cols-2 gap-3">
          {calendarEvents.map((event) => (
            <Card key={event.id} className="p-4 flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{event.title}</p>
                <p className="text-[10px] text-slate-400">{event.date}</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${CATEGORY_CLASS[event.category]}`}>
                {event.category}
              </span>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  )
}
