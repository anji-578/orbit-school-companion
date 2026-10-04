import type { StudentDestination, StudentNavParams } from '../../features/student-app/studentNav'

export type NotificationRoute = {
  dest: StudentDestination
  params?: StudentNavParams
  title?: string
}

/** Map a notification to a student destination. Unknown targets go to the inbox. */
export function routeForNotification(input: {
  eventType?: string | null
  title?: string
  body?: string
}): NotificationRoute {
  const hay = `${input.eventType ?? ''} ${input.title ?? ''} ${input.body ?? ''}`.toLowerCase()
  if (hay.includes('homework') || hay.includes('assignment') || hay.includes('due')) {
    return { dest: 'homework', title: 'Homework' }
  }
  if (hay.includes('exam') || hay.includes('assessment') || hay.includes('result') || hay.includes('marks')) {
    return { dest: 'assessments', title: 'Assessments' }
  }
  if (hay.includes('club') || hay.includes('extracurricular')) {
    return { dest: 'extracurriculars', title: 'Clubs' }
  }
  if (hay.includes('competition') || hay.includes('olympiad')) {
    return { dest: 'competitions', title: 'Competitions' }
  }
  if (hay.includes('absent') || hay.includes('attendance')) {
    return { dest: 'attendance', title: 'Attendance' }
  }
  if (hay.includes('syllabus') || hay.includes('topic')) {
    return { dest: 'syllabus', title: 'Topics' }
  }
  if (hay.includes('timetable') || hay.includes('schedule') || hay.includes('class')) {
    return { dest: 'schedule', title: 'Classes' }
  }
  return { dest: 'alerts', title: 'Notifications' }
}
