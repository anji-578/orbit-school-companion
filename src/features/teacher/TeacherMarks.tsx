import { useMemo } from 'react'
import { Save } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card } from '../../components/ui/primitives'
import { classLabelsMatch } from '../../lib/schoolPolicy'
import type { StudentGrade } from '../../types'

export function TeacherMarks() {
  const lang = useOrbitStore((s) => s.lang)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const roster = useOrbitStore((s) => s.roster)
  const teacherActiveClass = useOrbitStore((s) => s.teacherActiveClass)
  const updateGrade = useOrbitStore((s) => s.updateGrade)
  const saveGrades = useOrbitStore((s) => s.saveGrades)

  const t = (key: string) => translate(lang, key)

  const marksRows = useMemo(() => {
    const classRoster = teacherActiveClass
      ? roster.filter((r) => classLabelsMatch(r.classLabel, teacherActiveClass))
      : roster

    if (classRoster.length) {
      return classRoster.map((student) => {
        const existing = studentGrades.find(
          (g) => g.studentId === student.id || g.name === student.name,
        )
        if (existing) {
          return existing.studentId
            ? existing
            : { ...existing, studentId: student.id }
        }
        const draft: StudentGrade = {
          id: `demo50_${student.id}`,
          studentId: student.id,
          name: student.name,
          math: '',
          science: '',
          chem: '',
          comment: '',
        }
        return draft
      })
    }

    return studentGrades
  }, [roster, studentGrades, teacherActiveClass])

  return (
    <Panel
      title={t('teacherMarksTitle')}
      subtitle={t('teacherMarksDesc')}
      action={
        <button
          type="button"
          onClick={() => {
            // Ensure draft rows for this class are in the store before save.
            const store = useOrbitStore.getState()
            const missing = marksRows.filter((row) => !store.studentGrades.some((g) => g.id === row.id))
            if (missing.length) {
              useOrbitStore.setState({ studentGrades: [...store.studentGrades, ...missing] })
            }
            void saveGrades()
          }}
          className="btn-accent flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
        >
          <Save className="h-3.5 w-3.5" aria-hidden />
          {t('saveMarks')}
        </button>
      }
    >
      <div className="space-y-4">
        {!marksRows.length ? (
          <Card className="p-6 text-sm text-slate-400">
            No students in the active class yet. Switch class in the sidebar, or confirm the roster has loaded.
          </Card>
        ) : (
          marksRows.map((grade) => (
            <Card key={grade.id} className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-white">{grade.name}</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('mathSubject')}</span>
                  <input
                    type="text"
                    value={grade.math}
                    onChange={(e) => {
                      ensureGradeInStore(grade)
                      updateGrade(grade.id, { math: e.target.value })
                    }}
                    className="field w-full rounded-lg px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('scienceSubject')}</span>
                  <input
                    type="text"
                    value={grade.science}
                    onChange={(e) => {
                      ensureGradeInStore(grade)
                      updateGrade(grade.id, { science: e.target.value })
                    }}
                    className="field w-full rounded-lg px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{t('chemLabSubject')}</span>
                  <input
                    type="text"
                    value={grade.chem}
                    onChange={(e) => {
                      ensureGradeInStore(grade)
                      updateGrade(grade.id, { chem: e.target.value })
                    }}
                    className="field w-full rounded-lg px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="space-y-1 block">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Teacher comment</span>
                <textarea
                  value={grade.comment}
                  onChange={(e) => {
                    ensureGradeInStore(grade)
                    updateGrade(grade.id, { comment: e.target.value })
                  }}
                  rows={2}
                  className="field w-full rounded-lg px-3 py-2 text-sm resize-none"
                />
              </label>
            </Card>
          ))
        )}
      </div>
    </Panel>
  )
}

function ensureGradeInStore(grade: StudentGrade) {
  const store = useOrbitStore.getState()
  if (store.studentGrades.some((g) => g.id === grade.id)) return
  useOrbitStore.setState({ studentGrades: [...store.studentGrades, grade] })
}
