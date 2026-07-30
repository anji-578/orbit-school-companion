import { useState } from 'react'
import { CalendarClock, Minus, Plus } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { syllabusTimeline } from '../../data/demo'
import { Panel, Card, Eyebrow, ProgressBar } from '../../components/ui/primitives'

export function TeacherSyllabus() {
  const lang = useOrbitStore((s) => s.lang)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [progress, setProgress] = useState<Record<string, number>>(
    Object.fromEntries(syllabusTimeline.map((item) => [item.id, item.progress])),
  )

  const t = (key: string) => translate(lang, key)

  const adjust = (id: string, chapter: string, delta: number) => {
    setProgress((prev) => {
      const next = Math.min(100, Math.max(0, (prev[id] ?? 0) + delta))
      if (next === 100 && prev[id] !== 100) {
        triggerToast(`${chapter} marked complete!`)
      }
      return { ...prev, [id]: next }
    })
  }

  return (
    <Panel title={t('teacherSyllabusTitle')} subtitle={t('teacherSyllabusDesc')}>
      <div className="space-y-3">
        {syllabusTimeline.map((item) => {
          const value = progress[item.id] ?? item.progress
          return (
            <Card key={item.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{item.chapter}</h3>
                  <Eyebrow>{item.subject}</Eyebrow>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" aria-hidden /> {item.plannedDate}
                </span>
              </div>
              <ProgressBar value={value} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-white">{value}%</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease progress for ${item.chapter}`}
                    onClick={() => adjust(item.id, item.chapter, -10)}
                    className="btn-ghost p-1.5 rounded-lg text-white"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Increase progress for ${item.chapter}`}
                    onClick={() => adjust(item.id, item.chapter, 10)}
                    className="btn-ghost p-1.5 rounded-lg text-white"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Panel>
  )
}
