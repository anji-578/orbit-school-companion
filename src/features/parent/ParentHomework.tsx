import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { childDisplayName } from '../../lib/linkedStudent'
import { ChildSwitcher } from '../../components/ui/ChildSwitcher'
import { Panel, Card, Eyebrow, ProgressBar } from '../../components/ui/primitives'

/** Parent read-only homework tracker for the linked child. */
export function ParentHomework() {
  const lang = useOrbitStore((s) => s.lang)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const tasks = useOrbitStore((s) => s.tasks)
  const t = (key: string) => translate(lang, key)
  const childName = childDisplayName(linkedStudent, t('noChildLinkedTitle'))

  const completed = tasks.filter((task) => task.completed)
  const pending = tasks.filter((task) => !task.completed)
  const percent = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0

  return (
    <Panel title={t('parentHomeworkTitle')} subtitle={t('parentHomeworkDesc').replace('{name}', childName)}>
      <ChildSwitcher compact />
      {tasks.length === 0 ? (
        <p className="text-xs text-slate-400 py-2 text-center">No homework assigned for this class yet.</p>
      ) : null}
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
          <p className="text-xs text-slate-400 py-4 text-center">{t('allHomeworkDone')}</p>
        ) : (
          pending.map((task) => (
            <Card key={task.id} className="p-3.5">
              <p className="text-xs font-bold text-white">{task.task}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {task.subject} · {task.due} · {task.difficulty}
              </p>
            </Card>
          ))
        )}
      </div>

      {completed.length > 0 ? (
        <div className="space-y-2.5">
          <Eyebrow>{t('done')}</Eyebrow>
          {completed.map((task) => (
            <Card key={task.id} className="p-3.5 opacity-60">
              <p className="text-xs font-bold text-white line-through">{task.task}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{task.subject}</p>
            </Card>
          ))}
        </div>
      ) : null}
    </Panel>
  )
}
