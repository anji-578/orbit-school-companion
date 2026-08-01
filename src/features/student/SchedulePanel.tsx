import { FlaskConical, MapPin, User } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const

export function SchedulePanel() {
  const lang = useOrbitStore((s) => s.lang)
  const selectedGanttDay = useOrbitStore((s) => s.selectedGanttDay)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const setGanttDay = useOrbitStore((s) => s.setGanttDay)

  const t = (key: string) => translate(lang, key)
  const day = timetableByDay[selectedGanttDay] ?? timetableByDay.MON
  const hasSlots = Boolean(day && (day.theory.length > 0 || day.lab.length > 0))

  return (
    <Panel title={t('studentSchedule')} subtitle={t('todaysSchedule')}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Weekday">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={selectedGanttDay === d}
            onClick={() => setGanttDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              selectedGanttDay === d
                ? 'bg-[var(--accent)] text-black border-transparent'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {!hasSlots ? (
        <p className="text-xs text-slate-400 py-6 text-center">{t('timetableEmpty')}</p>
      ) : (
        <>
          {day.theory.length > 0 ? (
            <div className="space-y-3">
              <Eyebrow>{t('ganttTheoryTrack')}</Eyebrow>
              <div className="grid sm:grid-cols-2 gap-3">
                {day.theory.map((slot) => (
                  <Card key={slot.id} className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full accent-soft text-[var(--accent2)]">
                        {slot.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {slot.start} – {slot.end}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{slot.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden /> {slot.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" aria-hidden /> {slot.teacher}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {day.lab.length > 0 ? (
            <div className="space-y-3">
              <Eyebrow>{t('ganttLabTrack')}</Eyebrow>
              <div className="grid sm:grid-cols-2 gap-3">
                {day.lab.map((slot) => (
                  <Card key={slot.id} className="p-4 space-y-1.5 border-l-2 border-l-[var(--accent2)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 flex items-center gap-1">
                        <FlaskConical className="h-3 w-3" aria-hidden /> {slot.code}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {slot.start} – {slot.end}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{slot.name}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden /> {slot.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" aria-hidden /> {slot.teacher}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  )
}
