import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Plus } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { fetchHomeworkClassOverview, type HomeworkClassOverview } from '../../lib/schoolOpsApi'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import type { HomeworkTask } from '../../types'

const DIFFICULTIES: HomeworkTask['difficulty'][] = ['Easy', 'Medium', 'Hard']

export function TeacherHomework() {
  const lang = useOrbitStore((s) => s.lang)
  const tasks = useOrbitStore((s) => s.tasks)
  const roster = useOrbitStore((s) => s.roster)
  const assignHomework = useOrbitStore((s) => s.assignHomework)

  const [subject, setSubject] = useState('Mathematics')
  const [task, setTask] = useState('')
  const [due, setDue] = useState('Tomorrow')
  const [xp, setXp] = useState(40)
  const [difficulty, setDifficulty] = useState<HomeworkTask['difficulty']>('Medium')
  const [overview, setOverview] = useState<Record<number, HomeworkClassOverview>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const t = (key: string) => translate(lang, key)
  const taskIds = useMemo(() => tasks.map((item) => item.id), [tasks])

  useEffect(() => {
    if (!isSupabaseConfigured() || taskIds.length === 0) {
      setOverview({})
      return
    }
    let cancelled = false
    void fetchHomeworkClassOverview(taskIds).then((data) => {
      if (!cancelled) setOverview(data)
    })
    return () => {
      cancelled = true
    }
  }, [taskIds.join(',')])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!task.trim()) return
    assignHomework({ subject, task: task.trim(), due, xp, difficulty })
    setTask('')
  }

  const localFallback = (item: HomeworkTask): HomeworkClassOverview => {
    const students = roster.map((r) => ({
      studentId: r.id,
      name: r.name,
      completed: Boolean(r.isDemo) ? item.completed : false,
    }))
    return {
      homeworkId: item.id,
      totalStudents: students.length || 1,
      completedCount: students.filter((s) => s.completed).length,
      students,
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={t('teacherHomeworkTitle')} subtitle={t('teacherHomeworkDesc')}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('subject')}</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('due')}</span>
            <input
              type="text"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="e.g. Friday"
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="space-y-1 block sm:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('task')}</span>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g. Complete exercise 4.2 Q1–Q8"
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">XP</span>
            <input
              type="number"
              min={10}
              max={200}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value) || 40)}
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('difficulty')}</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as HomeworkTask['difficulty'])}
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d} className="bg-[#0D1120]">
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="btn-accent sm:col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {t('assignHomework')}
          </button>
        </form>
      </Panel>

      <Panel title={t('classHomeworkQueue')} subtitle={t('homeworkClassOverviewDesc')}>
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noHomeworkYet')}</p>
          ) : (
            tasks.map((item) => {
              const progress = overview[item.id] ?? localFallback(item)
              const open = expandedId === item.id
              const percent = progress.totalStudents
                ? Math.round((progress.completedCount / progress.totalStudents) * 100)
                : 0
              return (
                <Card key={item.id} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : item.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.task}</p>
                      <Eyebrow>
                        {item.subject} · {item.due} · +{item.xp} XP ·{' '}
                        {t('homeworkDoneCount')
                          .replace('{done}', String(progress.completedCount))
                          .replace('{total}', String(progress.totalStudents))}{' '}
                        ({percent}%)
                      </Eyebrow>
                    </div>
                    {open ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
                    )}
                  </button>
                  {open ? (
                    <div className="border-t border-white/10 px-4 pb-4 space-y-2">
                      {progress.students.map((student) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0"
                        >
                          <span className="text-xs font-semibold text-white truncate">{student.name}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                              student.completed ? 'text-emerald-300' : 'text-slate-500'
                            }`}
                          >
                            {student.completed ? (
                              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                            ) : (
                              <Circle className="h-3.5 w-3.5" aria-hidden />
                            )}
                            {student.completed ? t('done') : t('pending')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </Card>
              )
            })
          )}
        </div>
      </Panel>
    </div>
  )
}
