import { z } from 'zod'
import type { HomeworkLike } from '@/domain/priority/homework-priority'

const homeworkRowSchema = z.object({
  id: z.union([z.number(), z.string()]),
  subject: z.string(),
  task: z.string(),
  due: z.string(),
  completed: z.boolean(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  estimatedMinutes: z.number().optional(),
  started: z.boolean().optional(),
})

/** Map + validate an unknown homework row at the repository boundary. */
export function mapHomeworkRow(row: unknown): HomeworkLike {
  return homeworkRowSchema.parse(row)
}

export function mapHomeworkRows(rows: unknown[]): HomeworkLike[] {
  return rows.map(mapHomeworkRow)
}
