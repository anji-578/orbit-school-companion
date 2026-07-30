import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import { findDemoUser } from './demoUsers'
import { restoreSupabaseSession, supabaseLogin, supabaseLogout } from './supabaseAuth'

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
  bootstrapped: boolean
  setPendingRole: (role: Role | null) => void
  login: (role: Role, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearAuthError: () => void
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      authError: null,
      pendingRole: null,
      bootstrapped: false,

      setPendingRole: (pendingRole) => set({ pendingRole, authError: null }),

      clearAuthError: () => set({ authError: null }),

      bootstrap: async () => {
        if (get().bootstrapped) return
        if (isSupabaseConfigured()) {
          const profile = await restoreSupabaseSession()
          if (profile) {
            set({
              session: {
                userId: profile.id,
                role: profile.role,
                email: profile.email,
                displayName: profile.displayName,
                subtitle: profile.subtitle,
                provider: 'supabase',
              },
              pendingRole: null,
              authError: null,
            })
          } else if (get().session?.provider === 'supabase') {
            // Stale persisted supabase session
            set({ session: null })
          }
        }
        set({ bootstrapped: true })
      },

      login: async (role, email, password) => {
        if (isSupabaseConfigured()) {
          const result = await supabaseLogin(role, email, password)
          if (!result.ok) {
            set({ authError: result.error, session: null })
            return false
          }
          set({
            authError: null,
            pendingRole: null,
            session: {
              userId: result.profile.id,
              role: result.profile.role,
              email: result.profile.email,
              displayName: result.profile.displayName,
              subtitle: result.profile.subtitle,
              provider: 'supabase',
            },
          })
          return true
        }

        await new Promise((r) => setTimeout(r, 350))
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

      logout: async () => {
        if (get().session?.provider === 'supabase' || isSupabaseConfigured()) {
          await supabaseLogout()
        }
        set({ session: null, pendingRole: null, authError: null })
      },
    }),
    {
      name: 'orbit-auth-v1',
      partialize: (s) => ({ session: s.session }),
    },
  ),
)
