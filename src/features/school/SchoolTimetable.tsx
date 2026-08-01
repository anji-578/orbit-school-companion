import { useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import {
  createEmptySlot,
  type TimetableByDay,
  type TimetableSlot,
} from '../../lib/timetableApi'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import { readSchoolPolicy, saveSchoolPolicy } from '../../lib/schoolPolicy'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const

function cloneWeek(week: TimetableByDay): TimetableByDay {
  const next: TimetableByDay = {}
  for (const day of DAYS) {
    const block = week[day] ?? { theory: [], lab: [] }
    next[day] = {
      theory: block.theory.map((s) => ({ ...s })),
      lab: block.lab.map((s) => ({ ...s })),
    }
  }
  return next
}

export function SchoolTimetable() {
  const lang = useOrbitStore((s) => s.lang)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const saveTimetable = useOrbitStore((s) => s.saveTimetable)
  const selectedGanttDay = useOrbitStore((s) => s.selectedGanttDay)
  const setGanttDay = useOrbitStore((s) => s.setGanttDay)

  const [draft, setDraft] = useState<TimetableByDay>(() => cloneWeek(timetableByDay))
  const [saving, setSaving] = useState(false)
  const [className, setClassName] = useState(() => readSchoolPolicy().classLabel)
  const t = (key: string) => translate(lang, key)
  const dayCode = DAYS.includes(selectedGanttDay as (typeof DAYS)[number])
    ? (selectedGanttDay as (typeof DAYS)[number])
    : 'MON'
  const day = draft[dayCode] ?? { theory: [], lab: [] }

  useEffect(() => {
    setDraft(cloneWeek(timetableByDay))
  }, [timetableByDay])

  const updateSlot = (type: 'Theory' | 'Lab', id: string, patch: Partial<TimetableSlot>) => {
    setDraft((prev) => {
      const block = prev[dayCode] ?? { theory: [], lab: [] }
      const listKey = type === 'Lab' ? 'lab' : 'theory'
      return {
        ...prev,
        [dayCode]: {
          ...block,
          [listKey]: block[listKey].map((s) => (s.id === id ? { ...s, ...patch } : s)),
        },
      }
    })
  }

  const addSlot = (type: 'Theory' | 'Lab') => {
    setDraft((prev) => {
      const block = prev[dayCode] ?? { theory: [], lab: [] }
      const listKey = type === 'Lab' ? 'lab' : 'theory'
      return {
        ...prev,
        [dayCode]: {
          ...block,
          [listKey]: [...block[listKey], createEmptySlot(type)],
        },
      }
    })
  }

  const removeSlot = (type: 'Theory' | 'Lab', id: string) => {
    setDraft((prev) => {
      const block = prev[dayCode] ?? { theory: [], lab: [] }
      const listKey = type === 'Lab' ? 'lab' : 'theory'
      return {
        ...prev,
        [dayCode]: {
          ...block,
          [listKey]: block[listKey].filter((s) => s.id !== id),
        },
      }
    })
  }

  const onSave = async () => {
    setSaving(true)
    await saveSchoolPolicy({ classLabel: className })
    await saveTimetable(className.trim() || readSchoolPolicy().classLabel, draft)
    setSaving(false)
  }

  const renderEditor = (type: 'Theory' | 'Lab', slots: TimetableSlot[]) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{type === 'Lab' ? t('ganttLabTrack') : t('ganttTheoryTrack')}</Eyebrow>
        <button
          type="button"
          onClick={() => addSlot(type)}
          className="btn-ghost inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {t('addPeriod')}
        </button>
      </div>
      {slots.length === 0 ? (
        <p className="text-[11px] text-slate-500 py-2">{t('noPeriodsYet')}</p>
      ) : (
        slots.map((slot) => (
          <Card key={slot.id} className="p-3.5 space-y-2">
            <div className="grid sm:grid-cols-6 gap-2">
              <label className="space-y-1 block sm:col-span-1">
                <span className="text-[9px] font-bold uppercase text-slate-500">Code</span>
                <input
                  value={slot.code}
                  onChange={(e) => updateSlot(type, slot.id, { code: e.target.value })}
                  className="field w-full rounded-lg px-2 py-1.5 text-xs"
                />
              </label>
              <label className="space-y-1 block sm:col-span-2">
                <span className="text-[9px] font-bold uppercase text-slate-500">{t('subject')}</span>
                <input
                  value={slot.name}
                  onChange={(e) => updateSlot(type, slot.id, { name: e.target.value })}
                  className="field w-full rounded-lg px-2 py-1.5 text-xs"
                  placeholder="Mathematics"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[9px] font-bold uppercase text-slate-500">Start</span>
                <input
                  value={slot.start}
                  onChange={(e) => updateSlot(type, slot.id, { start: e.target.value })}
                  className="field w-full rounded-lg px-2 py-1.5 text-xs"
                  placeholder="08:00"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[9px] font-bold uppercase text-slate-500">End</span>
                <input
                  value={slot.end}
                  onChange={(e) => updateSlot(type, slot.id, { end: e.target.value })}
                  className="field w-full rounded-lg px-2 py-1.5 text-xs"
                  placeholder="08:50"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeSlot(type, slot.id)}
                  className="w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20"
                  aria-label={`Remove ${slot.name || 'period'}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              <label className="space-y-1 block">
                <span className="text-[9px] font-bold uppercase text-slate-500">{t('room')}</span>
                <input
                  value={slot.room}
                  onChange={(e) => updateSlot(type, slot.id, { room: e.target.value })}
                  className="field w-full rounded-lg px-2 py-1.5 text-xs"
                  placeholder="Room 204"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[9px] font-bold uppercase text-slate-500">{t('teacher')}</span>
                <input
                  value={slot.teacher}
                  onChange={(e) => updateSlot(type, slot.id, { teacher: e.target.value })}
                  className="field w-full rounded-lg px-2 py-1.5 text-xs"
                  placeholder="Mrs. Davis"
                />
              </label>
            </div>
          </Card>
        ))
      )}
    </div>
  )

  return (
    <Panel
      title={t('schoolTimetableTitle')}
      subtitle={t('schoolTimetableDesc').replace('{class}', className)}
      action={
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="btn-accent flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" aria-hidden />
          {saving ? t('saving') : t('saveTimetable')}
        </button>
      }
    >
      {!isSupabaseConfigured() ? (
        <p className="text-xs text-amber-300/90 mb-3">{t('timetableNeedsCloud')}</p>
      ) : null}

      <label className="block mb-3 max-w-xs space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase">{t('activeClassLabel')}</span>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          onBlur={() => {
            void saveSchoolPolicy({ classLabel: className })
          }}
          className="field w-full rounded-lg px-3 py-2 text-sm"
          placeholder="e.g. Grade 8-A"
        />
      </label>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Weekday">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={dayCode === d}
            onClick={() => setGanttDay(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              dayCode === d
                ? 'bg-[var(--accent)] text-black border-transparent'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {renderEditor('Theory', day.theory)}
      {renderEditor('Lab', day.lab)}
    </Panel>
  )
}
