export type HomeworkLike = {
  id: number | string
  subject: string
  task: string
  due: string
  completed: boolean
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  estimatedMinutes?: number
  started?: boolean
}

export function taskMinutes(task: HomeworkLike): number {
  if (task.estimatedMinutes != null) return task.estimatedMinutes
  if (task.difficulty === 'Hard') return 45
  if (task.difficulty === 'Easy') return 15
  return 25
}

/** Lower is more urgent. Matches HomeToday/LearnHub heuristics. */
export function dueUrgency(due: string): number {
  const d = due.toLowerCase()
  if (d.includes('tomorrow') || d.includes('today')) return 0
  if (d.includes('2 day')) return 1
  if (d.includes('completed')) return 9
  return 2
}

export function rankHomeworkPriority(tasks: HomeworkLike[]): HomeworkLike[] {
  return [...tasks.filter((t) => !t.completed)].sort(
    (a, b) => dueUrgency(a.due) - dueUrgency(b.due) || taskMinutes(b) - taskMinutes(a),
  )
}

export function selectUrgentHomework(tasks: HomeworkLike[]): HomeworkLike | undefined {
  const ranked = rankHomeworkPriority(tasks)
  return ranked.find((t) => dueUrgency(t.due) === 0) ?? ranked[0]
}
