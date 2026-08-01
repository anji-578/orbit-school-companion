import { Briefcase, MapPin, Wallet } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { teacherVacancies } from '../../data/demo'
import { Panel, Card, Eyebrow, ProgressBar } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'

export function TeacherJobs() {
  const lang = useOrbitStore((s) => s.lang)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const t = (key: string) => translate(lang, key)

  return (
    <Panel title={t('teacherJobsTitle')} subtitle={t('teacherJobsDesc')}>
      <DemoNotice detailKey="demoJobsHint" />
      <div className="grid sm:grid-cols-2 gap-4">
        {teacherVacancies.map((job) => (
          <Card key={job.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="h-10 w-10 rounded-xl accent-soft flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                {job.match}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{job.title}</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" aria-hidden /> {job.school}
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Wallet className="h-3 w-3" aria-hidden /> {job.pay}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Eyebrow>Match Score</Eyebrow>
                <span className="text-xs font-black text-white">{job.matchPct}%</span>
              </div>
              <ProgressBar value={job.matchPct} />
            </div>
            <button
              type="button"
              onClick={() => triggerToast(`Application sent for ${job.title} at ${job.school} (demo).`)}
              className="btn-accent w-full px-3 py-2 rounded-xl text-xs font-bold"
            >
              Apply Now
            </button>
          </Card>
        ))}
      </div>
    </Panel>
  )
}
