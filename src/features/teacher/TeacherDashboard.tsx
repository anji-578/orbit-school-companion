import { ArrowRight, Briefcase, CalendarDays, UserCheck } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { syllabusTimeline, teacherVacancies, todayTimeline } from '../../data/demo'
import { Card, Eyebrow, Panel, ProgressBar, StatTile } from '../../components/ui/primitives'

export function TeacherDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const roster = useOrbitStore((s) => s.roster)
  const leaves = useOrbitStore((s) => s.leaves)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  const t = (key: string) => translate(lang, key)
  const presentCount = roster.filter((r) => r.present).length
  const pendingLeaves = leaves.filter((l) => l.status === 'Reviewing').length
  const avgSyllabusProgress = Math.round(
    syllabusTimeline.reduce((sum, item) => sum + item.progress, 0) / Math.max(1, syllabusTimeline.length),
  )
  const bestMatch = [...teacherVacancies].sort((a, b) => b.matchPct - a.matchPct)[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white font-display">{t('goodDayTeacher')}, Mrs. Davis 🍎</h1>
        <p className="text-xs text-slate-400 mt-1">{t('teacherSub')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Class Present"
          value={`${presentCount}/${roster.length}`}
          onClick={() => setActiveTab('teacher-attendance')}
          accent="var(--accent2)"
        />
        <StatTile label={t('teacherLeavesTitle')} value={String(pendingLeaves)} hint="Pending review" onClick={() => setActiveTab('teacher-leaves')} />
        <StatTile label={t('teacherSyllabusTitle')} value={`${avgSyllabusProgress}%`} onClick={() => setActiveTab('teacher-syllabus')} />
        {bestMatch ? (
          <StatTile label={t('teacherJobsTitle')} value={`${bestMatch.matchPct}%`} hint={bestMatch.title} onClick={() => setActiveTab('teacher-jobs')} />
        ) : null}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t('todaysSchedule')}>
          <div className="space-y-2.5">
            {todayTimeline.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">{item.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {item.time} · {item.room}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${
                    item.status === 'Live'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                      : item.status === 'Completed'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t('teacherSyllabusTitle')} subtitle={t('teacherSyllabusDesc')}>
          <div className="space-y-3">
            {syllabusTimeline.map((item) => (
              <Card key={item.id} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{item.chapter}</p>
                    <Eyebrow>
                      {item.subject} · {item.plannedDate}
                    </Eyebrow>
                  </div>
                  <span className="text-xs font-black text-white">{item.progress}%</span>
                </div>
                <ProgressBar value={item.progress} />
              </Card>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('teacher-attendance')}
          className="glass glass-hover rounded-2xl p-4 flex items-center gap-3 text-left"
        >
          <UserCheck className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
          <span className="text-xs font-bold text-white">{t('teacherAttendanceTitle')}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('teacher-leaves')}
          className="glass glass-hover rounded-2xl p-4 flex items-center gap-3 text-left"
        >
          <CalendarDays className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
          <span className="text-xs font-bold text-white">{t('teacherLeavesTitle')}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('teacher-jobs')}
          className="glass glass-hover rounded-2xl p-4 flex items-center gap-3 text-left"
        >
          <Briefcase className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
          <span className="text-xs font-bold text-white">{t('teacherJobsTitle')}</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" aria-hidden />
        </button>
      </div>
    </div>
  )
}
