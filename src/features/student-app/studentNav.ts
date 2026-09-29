/** Student app destinations — everything nests under Home | Learn | Grow | Me. */

export type StudentTab = 'home' | 'learn' | 'grow' | 'me'

export type StudentDestination =
  | 'home'
  | 'learn'
  | 'grow'
  | 'me'
  // Learn nest
  | 'subject'
  | 'upcoming'
  | 'homework'
  | 'schedule'
  | 'syllabus'
  | 'study-assistant'
  | 'scanner'
  | 'gk-quiz'
  | 'academics'
  | 'calendar'
  | 'assessments'
  // Grow nest
  | 'competitions'
  | 'extracurriculars'
  | 'interests'
  // Me nest
  | 'profile'
  | 'attendance'
  | 'achievements'
  | 'teachers'
  | 'alerts'
  | 'portfolio'
  | 'school-records'
  | 'settings'

export type StudentNavParams = {
  subject?: string
  taskId?: number | string
  section?: 'topics' | 'homework' | 'assessments' | 'resources' | 'progress'
}

export type StudentNavFrame = {
  dest: StudentDestination
  params?: StudentNavParams
  title?: string
}

export const DESTINATION_TITLES: Record<StudentDestination, string> = {
  home: 'Home',
  learn: 'Learn',
  grow: 'Grow',
  me: 'Me',
  subject: 'Subject',
  upcoming: 'Upcoming',
  homework: 'Homework',
  schedule: 'Classes',
  syllabus: 'Topics',
  'study-assistant': 'Ask Orbit',
  scanner: 'Paper scan',
  'gk-quiz': 'Challenge',
  academics: 'Progress reports',
  calendar: 'Calendar',
  assessments: 'Assessments',
  competitions: 'Competitions',
  extracurriculars: 'Clubs',
  interests: 'Interests',
  profile: 'Learning profile',
  attendance: 'Attendance',
  achievements: 'Achievements',
  teachers: 'My teachers',
  alerts: 'Notifications',
  portfolio: 'Portfolio',
  'school-records': 'School records',
  settings: 'Settings',
}

export function tabForDestination(dest: StudentDestination): StudentTab {
  if (dest === 'home' || dest === 'alerts') return 'home'
  if (
    dest === 'learn' ||
    dest === 'subject' ||
    dest === 'upcoming' ||
    dest === 'homework' ||
    dest === 'schedule' ||
    dest === 'syllabus' ||
    dest === 'study-assistant' ||
    dest === 'scanner' ||
    dest === 'gk-quiz' ||
    dest === 'academics' ||
    dest === 'calendar' ||
    dest === 'assessments'
  ) {
    return 'learn'
  }
  if (dest === 'grow' || dest === 'competitions' || dest === 'extracurriculars' || dest === 'interests') {
    return 'grow'
  }
  // me | profile | attendance | achievements | teachers | portfolio | school-records | settings
  return 'me'
}

export function titleForFrame(frame: StudentNavFrame): string {
  if (frame.title) return frame.title
  if (frame.dest === 'subject' && frame.params?.subject) return frame.params.subject
  return DESTINATION_TITLES[frame.dest]
}
