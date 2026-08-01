import { CalendarCheck, GraduationCap } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'

export function SchoolHiring() {
  const lang = useOrbitStore((s) => s.lang)
  const candidates = useOrbitStore((s) => s.candidates)
  const scheduleInterview = useOrbitStore((s) => s.scheduleInterview)

  const t = (key: string) => translate(lang, key)

  return (
    <Panel title={t('schoolHiringTitle')} subtitle={t('schoolHiringDesc')}>
      <DemoNotice detailKey="demoHiringHint" />
      <div className="grid sm:grid-cols-2 gap-4">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl accent-soft flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{candidate.name}</h3>
                <Eyebrow>{candidate.subject}</Eyebrow>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p>
                <span className="text-slate-500">Experience: </span>
                {candidate.experience}
              </p>
              <p>
                <span className="text-slate-500">Qualification: </span>
                {candidate.qualification}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                {candidate.status}
              </span>
              <button
                type="button"
                onClick={() => scheduleInterview(candidate.id)}
                disabled={candidate.status === 'Interview Scheduled'}
                className="btn-accent flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50"
              >
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
                Schedule Interview
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Panel>
  )
}
