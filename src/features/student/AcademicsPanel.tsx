import { Star } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { childDisplayName } from '../../lib/linkedStudent'
import { softSkills } from '../../data/demo'
import { Panel, Card, Eyebrow, ProgressBar } from '../../components/ui/primitives'
import { EmptyState } from '../../components/ui/EmptyState'

const SUBJECT_ROWS: { field: 'math' | 'science' | 'chem'; subjectKey: string; feedbackKey: string }[] = [
  { field: 'math', subjectKey: 'mathSubject', feedbackKey: 'mathFeedback' },
  { field: 'science', subjectKey: 'scienceSubject', feedbackKey: 'scienceFeedback' },
  { field: 'chem', subjectKey: 'chemLabSubject', feedbackKey: 'chemFeedback' },
]

function parseScore(raw: string): { obtained: number; total: number; percent: number } {
  const [obtainedRaw, totalRaw] = raw.split('/')
  const obtained = Number(obtainedRaw) || 0
  const total = Number(totalRaw) || 50
  return { obtained, total, percent: Math.round((obtained / total) * 100) }
}

function standingFor(percent: number): { key: string; className: string } {
  if (percent >= 90) return { key: 'standingExcellent', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' }
  if (percent >= 75) return { key: 'standingGood', className: 'bg-sky-500/15 text-sky-300 border-sky-500/25' }
  return { key: 'standingNeedsFocus', className: 'bg-amber-500/15 text-amber-300 border-amber-500/25' }
}

export function AcademicsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const role = useOrbitStore((s) => s.role)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  const t = (key: string) => translate(lang, key)
  const grade = studentGrades[0]
  const titleKey = role === 'parent' ? 'parentReportCard' : 'studentAcademics'

  if (!grade) {
    return (
      <EmptyState
        title={t('noGradesYetTitle')}
        description={classLinked ? t('noGradesYetDesc') : t('noClassLinkedDesc')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Panel title={t(titleKey)} subtitle={grade.comment}>
        <div className="overflow-x-auto orbit-scroll -mx-1">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/10">
                <th className="px-3 py-2">{t('tableHeadSubject')}</th>
                <th className="px-3 py-2">{t('tableHeadScore')}</th>
                <th className="px-3 py-2">{t('tableHeadStanding')}</th>
                <th className="px-3 py-2">{t('tableHeadActions')}</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECT_ROWS.map(({ field, subjectKey, feedbackKey }) => {
                const { obtained, total, percent } = parseScore(grade[field])
                const standing = standingFor(percent)
                return (
                  <tr key={field} className="border-b border-white/5 align-top">
                    <td className="px-3 py-3">
                      <p className="text-xs font-bold text-white">{t(subjectKey)}</p>
                      <p className="text-[10px] text-slate-400 mt-1 max-w-[220px]">{t(feedbackKey)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-sm font-black text-white">
                        {obtained}/{total}
                      </p>
                      <div className="w-24 mt-1.5">
                        <ProgressBar value={percent} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${standing.className}`}>
                        {t(standing.key)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {standing.key === 'standingNeedsFocus' ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab('scanner')}
                          className="btn-ghost px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
                        >
                          {t('scannerTitle')}
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold">{t('excellent')}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title={t('behaviorTitle')}>
        <div className="grid sm:grid-cols-2 gap-3">
          {softSkills.map((skill) => (
            <Card key={skill.label} className="p-4 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white">{skill.label}</span>
              <div className="flex items-center gap-0.5" role="img" aria-label={`${skill.score} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-3.5 w-3.5 ${idx < skill.score ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                    aria-hidden
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Panel>

      <Eyebrow>
        <span className="flex items-center gap-2">
          <Star className="h-3 w-3 text-amber-400 fill-amber-400" aria-hidden /> {childDisplayName(linkedStudent, grade.name)}
        </span>
      </Eyebrow>
    </div>
  )
}
