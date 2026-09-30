import { dueUrgency, type HomeworkLike } from '../priority/homework-priority'

export type ChapterLike = {
  id: string
  subject: string
  title: string
  progress: number
}

/** Continue = earliest urgent open homework, else first unfinished chapter. */
export function selectContinueTarget(
  tasks: HomeworkLike[],
  chapters: ChapterLike[],
): { kind: 'homework'; task: HomeworkLike } | { kind: 'chapter'; chapter: ChapterLike } | null {
  const pending = [...tasks.filter((t) => !t.completed)].sort((a, b) => dueUrgency(a.due) - dueUrgency(b.due))
  const hw = pending[0]
  if (hw) return { kind: 'homework', task: hw }
  const chapter = chapters.find((c) => c.progress < 100)
  if (chapter) return { kind: 'chapter', chapter }
  return null
}
