import { useEffect, useMemo, useState } from 'react'
import { Dumbbell, Mic2, Music, Palette, MapPin, Wallet, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'
import { ChildSwitcher } from '../../components/ui/ChildSwitcher'
import {
  fetchExtracurricularPrograms,
  requestExtracurricularJoin,
  type ExtraProgram,
} from '../../lib/opsSurfacesApi'

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  sports: { label: 'Sports', icon: Dumbbell },
  drawing: { label: 'Drawing', icon: Palette },
  singing: { label: 'Singing', icon: Mic2 },
  dancing: { label: 'Dancing', icon: Music },
}

export function ExtracurricularPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const role = useOrbitStore((s) => s.role)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [programs, setPrograms] = useState<ExtraProgram[]>([])
  const [activeCategory, setActiveCategory] = useState('sports')
  const [busyId, setBusyId] = useState<string | null>(null)

  const t = (key: string) => translate(lang, key)
  const titleKey = role === 'parent' ? 'parentExtracurriculars' : 'studentExtracurriculars'

  const reload = () => {
    void fetchExtracurricularPrograms(linkedStudent?.id).then((rows) => {
      setPrograms(rows)
      if (rows.length && !rows.some((r) => r.category === activeCategory)) {
        setActiveCategory(rows[0].category)
      }
    })
  }

  useEffect(() => {
    reload()
  }, [linkedStudent?.id])

  const categories = useMemo(() => {
    const keys = [...new Set(programs.map((p) => p.category))]
    return keys.length ? keys : Object.keys(CATEGORY_META)
  }, [programs])

  const items = programs.filter((p) => p.category === activeCategory)

  const onRequest = async (program: ExtraProgram) => {
    if (program.id.startsWith('local_')) {
      triggerToast(t('extraRequestDemoToast'))
      return
    }
    setBusyId(program.id)
    const result = await requestExtracurricularJoin(program.id, linkedStudent?.id)
    setBusyId(null)
    if (!result.ok) {
      triggerToast(result.error || t('extraRequestFailed'))
      return
    }
    triggerToast(t('extraRequestSent'))
    reload()
  }

  return (
    <div className="space-y-4">
      {role === 'parent' ? <ChildSwitcher compact /> : null}
      <Panel title={t(titleKey)} subtitle={t('extraSubtitle')}>
        {programs.some((p) => p.id.startsWith('local_')) ? <DemoNotice detailKey="demoExtraHint" /> : null}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Extracurricular categories">
          {categories.map((key) => {
            const meta = CATEGORY_META[key] || { label: key, icon: Dumbbell }
            const Icon = meta.icon
            const selected = activeCategory === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  selected
                    ? 'bg-[var(--accent)] text-black border-transparent'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {meta.label}
              </button>
            )
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-1">
          {items.map((item) => (
            <Card key={item.id} className="p-5 space-y-3">
              <div>
                <Eyebrow>{(CATEGORY_META[activeCategory] || { label: activeCategory }).label}</Eyebrow>
                <h3 className="text-sm font-bold text-white mt-1">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.coach}</p>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[var(--accent2)]" aria-hidden /> {item.loc}
                </p>
                <p className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-[var(--accent2)]" aria-hidden /> {item.cost}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId === item.id || Boolean(item.requestStatus)}
                onClick={() => void onRequest(item)}
                className="btn-ghost w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
              >
                <UserPlus className="h-3.5 w-3.5" aria-hidden />
                {item.requestStatus
                  ? t('extraRequested').replace('{status}', item.requestStatus)
                  : busyId === item.id
                    ? t('extraRequesting')
                    : t('requestToJoin')}
              </button>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  )
}
