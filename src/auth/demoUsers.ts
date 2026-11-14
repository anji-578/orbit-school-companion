import type { Role } from '../types'

export interface DemoUser {
  id: string
  role: Role
  email: string
  password: string
  displayName: string
  subtitle: string
}

/**
 * Local demo accounts — development / Vite demo only.
 * Production builds force an empty list so identity strings never ship in dist/.
 */
export const DEMO_USERS: DemoUser[] = import.meta.env.PROD
  ? []
  : [
      {
        id: 'u_student',
        role: 'student',
        email: 'student@orbit.app',
        password: 'student123',
        displayName: 'Ananya Rao',
        subtitle: 'Grade 8-A · Roll 14',
      },
      {
        id: 'u_parent',
        role: 'parent',
        email: 'parent@orbit.app',
        password: 'parent123',
        displayName: 'Parent of Ananya',
        subtitle: 'Guardian · Grade 8-A',
      },
      {
        id: 'u_teacher',
        role: 'teacher',
        email: 'teacher@orbit.app',
        password: 'teacher123',
        displayName: 'Mrs. Sarah Davis',
        subtitle: 'Mathematics · Class Teacher Grade 8-A',
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
  if (import.meta.env.PROD) return null
  const normalized = email.trim().toLowerCase()
  const user = DEMO_USERS.find((u) => u.role === role && u.email === normalized)
  if (!user || user.password !== password) return null
  return user
}

export function demoHintForRole(role: Role): { email: string; password: string } | null {
  if (import.meta.env.PROD) return null
  const u = DEMO_USERS.find((d) => d.role === role)
  if (!u) return null
  return { email: u.email, password: u.password }
}
