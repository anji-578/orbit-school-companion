import { Save } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card } from '../../components/ui/primitives'

export function TeacherMarks() {
  const lang = useOrbitStore((s) => s.lang)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const updateGrade = useOrbitStore((s) => s.updateGrade)
  const saveGrades = useOrbitStore((s) => s.saveGrades)

  const t = (key: string) => translate(lang, key)

  return (
    <Panel
      title={t('teacherMarksTitle')}
      subtitle={t('teacherMarksDesc')}
      action={
        <button
          type="button"
          onClick={saveGrades}
          className="btn-accent flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
        >
          <Save className="h-3.5 w-3.5" aria-hidden />
          {t('saveMarks')}
        </button>
      }
    >
      <div className="space-y-4">
        {studentGrades.map((grade) => (
          <Card key={grade.id} className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-white">{grade.name}</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="space-y-1 block">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('mathSubject')}</span>
                <input
                  type="text"
                  value={grade.math}
                  onChange={(e) => updateGrade(grade.id, { math: e.target.value })}
                  className="field w-full rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('scienceSubject')}</span>
                <input
                  type="text"
                  value={grade.science}
                  onChange={(e) => updateGrade(grade.id, { science: e.target.value })}
                  className="field w-full rounded-lg px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('chemLabSubject')}</span>
                <input
                  type="text"
                  value={grade.chem}
                  onChange={(e) => updateGrade(grade.id, { chem: e.target.value })}
                  className="field w-full rounded-lg px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="space-y-1 block">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Teacher comment</span>
              <textarea
                value={grade.comment}
                onChange={(e) => updateGrade(grade.id, { comment: e.target.value })}
                rows={2}
                className="field w-full rounded-lg px-3 py-2 text-sm resize-none"
              />
            </label>
          </Card>
        ))}
      </div>
    </Panel>
  )
}
