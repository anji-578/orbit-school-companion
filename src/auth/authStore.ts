import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'
import { findDemoUser } from './demoUsers'

export interface AuthSession {
  userId: string
  role: Role
  email: string
  displayName: string
  subtitle: string
  provider: 'local-demo' | 'supabase'
}

interface AuthState {
  session: AuthSession | null
  authError: string | null
  pendingRole: Role | null
  setPendingRole: (role: Role | null) => void
  login: (role: Role, email: string, password: string) => Promise<boolean>
  logout: () => void
  clearAuthError: () => void
}

/**
 * Auth store. Today: local demo users.
 * Later: swap `login` body to Supabase Auth when VITE_SUPABASE_* is set.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      authError: null,
      pendingRole: null,

      setPendingRole: (pendingRole) => set({ pendingRole, authError: null }),

      clearAuthError: () => set({ authError: null }),

      login: async (role, email, password) => {
        // Simulate network latency so UX matches future Supabase
        await new Promise((r) => setTimeout(r, 450))

        const user = findDemoUser(role, email, password)
        if (!user) {
          set({ authError: 'Invalid email or password for this profile.', session: null })
          return false
        }

        set({
          authError: null,
          pendingRole: null,
          session: {
            userId: user.id,
            role: user.role,
            email: user.email,
            displayName: user.displayName,
            subtitle: user.subtitle,
            provider: 'local-demo',
          },
        })
        return true
      },

      logout: () => set({ session: null, pendingRole: null, authError: null }),
    }),
    {
      name: 'orbit-auth-v1',
      partialize: (s) => ({ session: s.session }),
    },
  ),
)
