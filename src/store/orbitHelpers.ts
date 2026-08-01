import type { AttendanceRecord, HomeworkTask, SyllabusChapter } from '../types'

export function attendancePercent(records: AttendanceRecord[]) {
  if (!records.length) return 100
  const present = records.filter((r) => r.status === 'Present').length
  return Math.round((present / records.length) * 100)
}

export function homeworkPercent(tasks: HomeworkTask[]) {
  if (!tasks.length) return 100
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)
}

export function chapterProgress(chapter: SyllabusChapter) {
  if (!chapter.subtopics.length) return 0
  const done = chapter.subtopics.filter((s) => s.done).length
  return Math.round((done / chapter.subtopics.length) * 100)
}

export function curriculumProgress(chapters: SyllabusChapter[]) {
  const all = chapters.flatMap((c) => c.subtopics)
  if (!all.length) return 0
  return Math.round((all.filter((s) => s.done).length / all.length) * 100)
}
