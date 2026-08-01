import { useState } from 'react'
import { Dumbbell, Mic2, Music, Palette, Phone, MapPin, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { extracurricularListing } from '../../data/demo'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'

type CategoryKey = keyof typeof extracurricularListing

const CATEGORY_META: Record<CategoryKey, { label: string; icon: LucideIcon }> = {
  sports: { label: 'Sports', icon: Dumbbell },
  drawing: { label: 'Drawing', icon: Palette },
  singing: { label: 'Singing', icon: Mic2 },
  dancing: { label: 'Dancing', icon: Music },
}

const CATEGORY_KEYS = Object.keys(extracurricularListing) as CategoryKey[]

export function ExtracurricularPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const role = useOrbitStore((s) => s.role)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('sports')

  const t = (key: string) => translate(lang, key)
  const titleKey = role === 'parent' ? 'parentExtracurriculars' : 'studentExtracurriculars'
  const items = extracurricularListing[activeCategory] ?? []

  return (
    <Panel title={t(titleKey)} subtitle="Discover coaches and clubs to build skills beyond the classroom.">
      <DemoNotice detailKey="demoExtraHint" />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Extracurricular categories">
        {CATEGORY_KEYS.map((key) => {
          const meta = CATEGORY_META[key]
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
          <Card key={item.title} className="p-5 space-y-3">
            <div>
              <Eyebrow>{CATEGORY_META[activeCategory].label}</Eyebrow>
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
              onClick={() => triggerToast(`${t('callCoach')}: ${item.coach} (${item.phone}) — simulated.`)}
              className="btn-ghost w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {t('callCoach')}
            </button>
          </Card>
        ))}
      </div>
    </Panel>
  )
}
