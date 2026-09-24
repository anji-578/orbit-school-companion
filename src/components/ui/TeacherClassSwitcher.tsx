import { Layers } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'

/** Teacher multi-class picker — switches focused class for roster / attendance / homework. */
export function TeacherClassSwitcher({ compact = false }: { compact?: boolean }) {
  const lang = useOrbitStore((s) => s.lang)
  const role = useOrbitStore((s) => s.role)
  const teacherClasses = useOrbitStore((s) => s.teacherClasses)
  const teacherActiveClass = useOrbitStore((s) => s.teacherActiveClass)
  const setTeacherActiveClass = useOrbitStore((s) => s.setTeacherActiveClass)
  const t = (key: string) => translate(lang, key)

  if (role !== 'teacher' || teacherClasses.length === 0) return null

  if (compact) {
    return (
      <label className="block space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
          <Layers className="h-3 w-3" aria-hidden />
          {t('teacherActiveClass')}
        </span>
        <select
          value={teacherActiveClass}
          onChange={(e) => void setTeacherActiveClass(e.target.value)}
          className="field w-full rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
          aria-label={t('teacherActiveClass')}
        >
          {teacherClasses.map((cls) => (
            <option key={cls} value={cls} className="bg-[#0D1120]">
              {cls}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 space-y-1.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-1.5">
        <Layers className="h-3 w-3" aria-hidden />
        {t('teacherActiveClass')}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {teacherClasses.map((cls) => {
          const selected = cls === teacherActiveClass
          return (
            <button
              key={cls}
              type="button"
              onClick={() => void setTeacherActiveClass(cls)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                selected
                  ? 'bg-[var(--accent)] text-black border-transparent'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
              }`}
              aria-pressed={selected}
            >
              {cls}
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-slate-500 px-1 leading-snug">{t('teacherActiveClassHint')}</p>
    </div>
  )
}
