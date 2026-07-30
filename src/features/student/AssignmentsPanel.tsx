import { CheckCircle2, Circle } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, ProgressBar } from '../../components/ui/primitives'

const DIFFICULTY_CLASS: Record<string, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Hard: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

export function AssignmentsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const tasks = useOrbitStore((s) => s.tasks)
  const toggleTask = useOrbitStore((s) => s.toggleTask)

  const t = (key: string) => translate(lang, key)
  const completed = tasks.filter((task) => task.completed)
  const pending = tasks.filter((task) => !task.completed)
  const percent = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 100

  return (
    <Panel title={t('studentAssignments')} subtitle={t('taskDesc')}>
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Eyebrow>{t('homeworkCompletion')}</Eyebrow>
          <span className="text-xs font-black text-white">{percent}%</span>
        </div>
        <ProgressBar value={percent} />
      </Card>

      <div className="space-y-2.5">
        <Eyebrow>{t('pendingTasks')}</Eyebrow>
        {pending.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No pending homework — you're all caught up!</p>
        ) : (
          pending.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                aria-label={`Mark ${task.task} complete`}
                onClick={() => toggleTask(task.id)}
                className="shrink-0 text-slate-500 hover:text-emerald-400 transition"
              >
                <Circle className="h-5 w-5" aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{task.task}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {task.subject} · {task.due}
                </p>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${DIFFICULTY_CLASS[task.difficulty]}`}
              >
                {task.difficulty}
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full accent-soft text-[var(--accent2)] shrink-0">
                +{task.xp} XP
              </span>
            </div>
          ))
        )}
      </div>

      {completed.length > 0 ? (
        <div className="space-y-2.5">
          <Eyebrow>Completed</Eyebrow>
          {completed.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 opacity-60"
            >
              <button
                type="button"
                aria-label={`Mark ${task.task} incomplete`}
                onClick={() => toggleTask(task.id)}
                className="shrink-0 text-emerald-400"
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate line-through">{task.task}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{task.subject}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  )
}
