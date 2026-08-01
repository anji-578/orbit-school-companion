import { Users } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { childClassLabel, type LinkedStudent } from '../../lib/linkedStudent'

function childOptionLabel(child: LinkedStudent) {
  const classLabel = childClassLabel(child)
  return classLabel ? `${child.displayName} · ${classLabel}` : child.displayName
}

/** Parent multi-child picker — only renders when 2+ children are linked. */
export function ChildSwitcher({ compact = false }: { compact?: boolean }) {
  const lang = useOrbitStore((s) => s.lang)
  const role = useOrbitStore((s) => s.role)
  const linkedStudents = useOrbitStore((s) => s.linkedStudents)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const setActiveChild = useOrbitStore((s) => s.setActiveChild)
  const t = (key: string) => translate(lang, key)

  if (role !== 'parent' || linkedStudents.length < 2) return null

  if (compact) {
    return (
      <label className="block space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
          <Users className="h-3 w-3" aria-hidden />
          {t('activeChild')}
        </span>
        <select
          value={linkedStudent?.id ?? ''}
          onChange={(e) => void setActiveChild(e.target.value)}
          className="field w-full rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
          aria-label={t('activeChild')}
        >
          {linkedStudents.map((child) => (
            <option key={child.id} value={child.id} className="bg-[#0D1120]">
              {childOptionLabel(child)}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 space-y-1.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">{t('activeChild')}</p>
      <div className="flex flex-wrap gap-1.5">
        {linkedStudents.map((child) => {
          const selected = child.id === linkedStudent?.id
          const classLabel = childClassLabel(child)
          return (
            <button
              key={child.id}
              type="button"
              onClick={() => void setActiveChild(child.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition text-left ${
                selected
                  ? 'bg-[var(--accent)] text-black border-transparent'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
              }`}
              aria-pressed={selected}
            >
              <span className="block">{child.displayName}</span>
              {classLabel ? (
                <span className={`block text-[9px] font-semibold ${selected ? 'text-black/70' : 'text-slate-500'}`}>
                  {classLabel}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
