import { useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import type { HomeworkTask } from '../../types'

const DIFFICULTIES: HomeworkTask['difficulty'][] = ['Easy', 'Medium', 'Hard']

export function TeacherHomework() {
  const lang = useOrbitStore((s) => s.lang)
  const tasks = useOrbitStore((s) => s.tasks)
  const assignHomework = useOrbitStore((s) => s.assignHomework)

  const [subject, setSubject] = useState('Mathematics')
  const [task, setTask] = useState('')
  const [due, setDue] = useState('Tomorrow')
  const [xp, setXp] = useState(40)
  const [difficulty, setDifficulty] = useState<HomeworkTask['difficulty']>('Medium')

  const t = (key: string) => translate(lang, key)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!task.trim()) return
    assignHomework({ subject, task: task.trim(), due, xp, difficulty })
    setTask('')
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

      <Panel title={t('classHomeworkQueue')}>
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noHomeworkYet')}</p>
          ) : (
            tasks.map((item) => (
              <Card key={item.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.task}</p>
                  <Eyebrow>
                    {item.subject} · {item.due} · +{item.xp} XP
                  </Eyebrow>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                    item.completed
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                  }`}
                >
                  {item.completed ? t('done') : t('pending')}
                </span>
              </Card>
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}
