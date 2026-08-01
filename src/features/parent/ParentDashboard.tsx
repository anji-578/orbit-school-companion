import { ArrowRight, Bus, CreditCard, MapPin, Sparkles } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { childDisplayName, childFirstName } from '../../lib/linkedStudent'
import { Card, Panel, StatTile } from '../../components/ui/primitives'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { LifecycleChart } from '../shared/LifecycleChart'

const SUBJECT_ROWS: { field: 'math' | 'science' | 'chem'; subjectKey: string }[] = [
  { field: 'math', subjectKey: 'mathSubject' },
  { field: 'science', subjectKey: 'scienceSubject' },
  { field: 'chem', subjectKey: 'chemLabSubject' },
]

function percentOf(raw: string): number {
  const [obtained, total] = raw.split('/').map(Number)
  if (!total) return 0
  return Math.round((obtained / total) * 100)
}

export function ParentDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const tasks = useOrbitStore((s) => s.tasks)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const fleet = useOrbitStore((s) => s.fleet)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  const t = (key: string) => translate(lang, key)
  const childName = childDisplayName(linkedStudent)
  const grade = studentGrades[0]
  const bus = fleet.find((b) => b.id === 'bus_14')

  const weakest = grade
    ? SUBJECT_ROWS.map((row) => ({ ...row, percent: percentOf(grade[row.field]) })).sort((a, b) => a.percent - b.percent)[0]
    : null

  const homeworkDone = tasks.filter((task) => task.completed).length
  const homeworkRatio = tasks.length ? `${homeworkDone}/${tasks.length}` : '0/0'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white font-display">{t('goodEveningParent')}</h1>
        <p className="text-xs text-slate-400 mt-1">{t('parentSub').replace('{name}', childFirstName(linkedStudent))}</p>
      </div>

      {!classLinked ? <InviteRedeemCard /> : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label={t('busTracker')}
          value={busReachedSchool ? t('childReached') : 'En route'}
          hint={bus ? bus.route : undefined}
          accent={busReachedSchool ? '#22C55E' : undefined}
          onClick={() => setActiveTab('transport')}
        />
        <StatTile
          label={t('billingOutstanding')}
          value={outstandingFees > 0 ? `₹${outstandingFees.toLocaleString()}` : 'Cleared'}
          accent={outstandingFees > 0 ? '#FF6B8B' : '#22C55E'}
          onClick={() => setActiveTab('payments')}
        />
        <StatTile
          label={t('homeworkTracker')}
          value={homeworkRatio}
          hint={t('homeworkCompletion')}
          onClick={() => setActiveTab('homework')}
        />
        {weakest ? (
          <StatTile
            label={t('weakestTopic')}
            value={t(weakest.subjectKey)}
            hint={`${weakest.percent}%`}
            accent="#FFB454"
            onClick={() => setActiveTab('academics')}
          />
        ) : null}
      </div>

      {busReachedSchool ? (
        <Card className="p-4 flex items-center gap-3 border-emerald-500/30">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Bus className="h-5 w-5 text-emerald-400" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('childReached')}</h3>
            <p className="text-[11px] text-slate-400">{t('childReachedSub')}</p>
          </div>
        </Card>
      ) : (
        <Panel title={t('liveTransit')} subtitle={bus?.route}>
          <div className="relative h-10 flex items-center px-1">
            <div className="absolute left-0 right-0 h-1.5 bg-white/10 rounded-full" />
            <div className="absolute h-1.5 bg-[#22C55E] rounded-full transition-all duration-700" style={{ width: `${busPosition}%` }} />
            <div
              className="absolute h-6 w-6 rounded-full bg-[#22C55E] flex items-center justify-center transition-all duration-700"
              style={{ left: `calc(${busPosition}% - 12px)` }}
            >
              <Bus className="h-3.5 w-3.5 text-black" aria-hidden />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden /> Home
            </span>
            <span>School</span>
          </div>
        </Panel>
      )}

      <LifecycleChart />

      <Panel title={t('parentImprovementDesc')}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl accent-soft flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{childName}</h3>
              <p className="text-[11px] text-slate-400">{t('parentHeroDesc')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className="btn-ghost flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white"
            >
              <CreditCard className="h-3.5 w-3.5" aria-hidden />
              {t('billingTitle')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className="btn-accent flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold"
            >
              {t('scannerTitle')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  )
}
