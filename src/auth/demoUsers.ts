import type { Role } from '../types'

export interface DemoUser {
  id: string
  role: Role
  email: string
  password: string
  displayName: string
  subtitle: string
}

/** Local demo accounts — replace with Supabase Auth when credentials are available. */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'u_student',
    role: 'student',
    email: 'student@orbit.app',
    password: 'student123',
    displayName: 'Ananya Rao',
    subtitle: 'Class 11-A · Roll 14',
  },
  {
    id: 'u_parent',
    role: 'parent',
    email: 'parent@orbit.app',
    password: 'parent123',
    displayName: 'Parent of Ananya',
    subtitle: 'Guardian · Orion Layout',
  },
  {
    id: 'u_teacher',
    role: 'teacher',
    email: 'teacher@orbit.app',
    password: 'teacher123',
    displayName: 'Mrs. Sarah Davis',
    subtitle: 'Mathematics · Class Teacher 11-A',
  },
  {
    id: 'u_school',
    role: 'school',
    email: 'admin@orbit.app',
    password: 'admin123',
    displayName: 'School Admin',
    subtitle: 'Sunrise Public School',
  },
]

export function findDemoUser(role: Role, email: string, password: string): DemoUser | null {
  const normalized = email.trim().toLowerCase()
  const user = DEMO_USERS.find((u) => u.role === role && u.email === normalized)
  if (!user || user.password !== password) return null
  return user
}

export function demoHintForRole(role: Role): { email: string; password: string } {
  const u = DEMO_USERS.find((d) => d.role === role)!
  return { email: u.email, password: u.password }
}
