/** Student app destinations — everything nests under Home | Learn | Grow | Me. */

export type StudentTab = 'home' | 'learn' | 'grow' | 'me'

export type StudentDestination =
  | 'home'
  | 'learn'
  | 'grow'
  | 'me'
  // Learn nest
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

export const DESTINATION_TITLES: Record<StudentDestination, string> = {
  home: 'Home',
  learn: 'Learn',
  grow: 'Grow',
  me: 'Me',
  homework: 'Homework',
  schedule: 'Classes',
  syllabus: 'Subjects',
  'study-assistant': 'Study coach',
  scanner: 'Paper scan',
  'gk-quiz': 'Quiz',
  academics: 'Progress reports',
  calendar: 'Calendar',
  assessments: 'Assessments',
  competitions: 'Competitions',
  extracurriculars: 'Clubs & activities',
  interests: 'Interests',
  profile: 'Profile',
  attendance: 'Attendance',
  achievements: 'Achievements',
  teachers: 'My teachers',
  alerts: 'Announcements',
  portfolio: 'Portfolio',
}

export function tabForDestination(dest: StudentDestination): StudentTab {
  if (dest === 'home' || dest === 'alerts') return 'home'
  if (
    dest === 'learn' ||
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
  return 'me'
}
