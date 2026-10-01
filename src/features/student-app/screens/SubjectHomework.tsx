import { useMemo } from 'react'
import { CheckCircle2, Circle, Camera, MessageCircle } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { SaPrimaryButton, SaSection } from '../components/SaUi'
import { SaEmpty } from '../components/NestedChrome'
import { useStudentNav } from '../StudentNavContext'

/** Phase 4 — subject-scoped homework with contextual Ask / Scan. */
export function SubjectHomework() {
  const { params, push, openAskOrbit } = useStudentNav()
  const subject = params.subject || ''
  const tasks = useOrbitStore((s) => s.tasks)
  const toggleTask = useOrbitStore((s) => s.toggleTask)
  const startTask = useOrbitStore((s) => s.startTask)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const scoped = useMemo(() => {
    const list = subject ? tasks.filter((t) => t.subject.toLowerCase() === subject.toLowerCase()) : tasks
    return {
      pending: list.filter((t) => !t.completed),
      done: list.filter((t) => t.completed),
    }
  }, [tasks, subject])

  const focus =
    params.taskId != null
      ? (scoped.pending.find((t) => String(t.id) === String(params.taskId)) ?? scoped.pending[0])
      : scoped.pending[0]

  if (!scoped.pending.length && !scoped.done.length) {
    return (
      <SaEmpty
        title={subject ? `No ${subject} homework` : 'No homework yet'}
        body="When your teacher assigns work, it will show up here."
        action={
          subject ? (
            <SaPrimaryButton onClick={() => openAskOrbit(`Help me revise ${subject}.`)}>
              Ask Orbit
            </SaPrimaryButton>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="space-y-5 pb-4">
      {focus ? (
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
              {focus.subject}
            </p>
            <p className="text-base font-extrabold text-[var(--fg)] mt-1 leading-snug">{focus.task}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              Due {focus.due} · {focus.difficulty} · +{focus.xp} XP
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SaPrimaryButton
              onClick={() => {
                if (!focus.started) startTask(focus.id)
                if (!focus.completed) {
                  toggleTask(focus.id)
                  triggerToast('Marked done')
                }
              }}
            >
              Mark done
            </SaPrimaryButton>
            <button
              type="button"
              onClick={() => openAskOrbit(`Help me with this ${focus.subject} homework: ${focus.task}`)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold border border-[var(--border)] text-[var(--fg)]"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Ask Orbit
            </button>
            <button
              type="button"
              onClick={() => push('scanner', { subject: focus.subject }, 'Paper scan')}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold border border-[var(--border)] text-[var(--fg)]"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden />
              Scan
            </button>
          </div>
        </div>
      ) : null}

      <SaSection eyebrow="Open">
        {scoped.pending.length === 0 ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-300 font-semibold px-0.5">
            All caught up in this subject.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {scoped.pending.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-3 px-0.5">
                <button
                  type="button"
                  aria-label={`Complete ${task.task}`}
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 text-[var(--muted)]"
                >
                  <Circle className="h-5 w-5" aria-hidden />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--fg)] truncate">{task.task}</p>
                  <p className="text-[11px] text-[var(--muted)]">Due {task.due}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SaSection>

      {scoped.done.length > 0 ? (
        <SaSection eyebrow="Done">
          <ul className="divide-y divide-[var(--border)] opacity-70">
            {scoped.done.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-2.5 px-0.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" aria-hidden />
                <span className="text-xs font-semibold text-[var(--muted)] line-through truncate">
                  {task.task}
                </span>
              </li>
            ))}
          </ul>
        </SaSection>
      ) : null}
    </div>
  )
}
