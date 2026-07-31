import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '../types'
import { isSupabaseConfigured } from '../lib/supabaseConfig'
import { findDemoUser } from './demoUsers'
import { createLocalAccount, findLocalAccount } from './localAccounts'
import { restoreSupabaseSession, supabaseLogin, supabaseLogout, supabaseRequestPasswordReset, supabaseSignUp, supabaseUpdatePassword } from './supabaseAuth'
import { getSupabase } from '../lib/supabase'

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
  authNotice: string | null
  pendingRole: Role | null
  bootstrapped: boolean
  passwordRecovery: boolean
  setPendingRole: (role: Role | null) => void
  login: (role: Role, email: string, password: string) => Promise<boolean>
  signup: (
    role: Role,
    input: { email: string; password: string; displayName: string },
  ) => Promise<'signed_in' | 'needs_confirmation' | false>
  requestPasswordReset: (email: string) => Promise<boolean>
  updatePassword: (password: string) => Promise<boolean>
  clearPasswordRecovery: () => void
  logout: () => Promise<void>
  clearAuthError: () => void
  clearAuthNotice: () => void
  bootstrap: () => Promise<void>
}

function subtitleFor(role: Role) {
  const map: Record<Role, string> = {
    student: 'Student profile',
    parent: 'Parent / guardian',
    teacher: 'Teacher profile',
    school: 'School admin',
  }
  return map[role]
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      authError: null,
      authNotice: null,
      pendingRole: null,
      bootstrapped: false,
      passwordRecovery: false,

      setPendingRole: (pendingRole) => set({ pendingRole, authError: null, authNotice: null }),

      clearAuthError: () => set({ authError: null }),
      clearAuthNotice: () => set({ authNotice: null }),
      clearPasswordRecovery: () => set({ passwordRecovery: false }),

      bootstrap: async () => {
        if (get().bootstrapped) return
        if (isSupabaseConfigured()) {
          const supabase = getSupabase()
          supabase?.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
              set({ passwordRecovery: true, pendingRole: get().pendingRole ?? 'student' })
            }
          })
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
            set({ session: null })
          }
        }
        set({ bootstrapped: true })
      },

      requestPasswordReset: async (email) => {
        if (!isSupabaseConfigured()) {
          set({ authError: 'Password reset requires Supabase. Configure keys first.' })
          return false
        }
        const result = await supabaseRequestPasswordReset(email)
        if (!result.ok) {
          set({ authError: result.error })
          return false
        }
        set({
          authError: null,
          authNotice: 'Password reset email sent. Open the link, then set a new password here.',
        })
        return true
      },

      updatePassword: async (password) => {
        const result = await supabaseUpdatePassword(password)
        if (!result.ok) {
          set({ authError: result.error })
          return false
        }
        set({
          authError: null,
          authNotice: 'Password updated. You can sign in with your new password.',
          passwordRecovery: false,
        })
        return true
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
            authNotice: null,
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

        await new Promise((r) => setTimeout(r, 250))
        const local = findLocalAccount(role, email, password)
        const demo = findDemoUser(role, email, password)
        const user = local ?? demo
        if (!user) {
          set({ authError: 'Invalid email or password for this profile.', session: null })
          return false
        }

        set({
          authError: null,
          authNotice: null,
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

      signup: async (role, input) => {
        if (isSupabaseConfigured()) {
          const result = await supabaseSignUp(role, {
            email: input.email,
            password: input.password,
            displayName: input.displayName,
            subtitle: subtitleFor(role),
          })
          if (!result.ok) {
            set({
              authError: result.error,
              authNotice: result.needsConfirmation ? result.error : null,
              session: null,
            })
            return result.needsConfirmation ? 'needs_confirmation' : false
          }
          set({
            authError: null,
            authNotice: null,
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
          return 'signed_in'
        }

        const created = createLocalAccount({
          role,
          email: input.email,
          password: input.password,
          displayName: input.displayName,
          subtitle: subtitleFor(role),
        })
        if (!created.ok) {
          set({ authError: created.error, session: null })
          return false
        }
        set({
          authError: null,
          authNotice: null,
          pendingRole: null,
          session: {
            userId: created.account.id,
            role: created.account.role,
            email: created.account.email,
            displayName: created.account.displayName,
            subtitle: created.account.subtitle,
            provider: 'local-demo',
          },
        })
        return 'signed_in'
      },

      logout: async () => {
        if (get().session?.provider === 'supabase' || isSupabaseConfigured()) {
          await supabaseLogout()
        }
        set({ session: null, pendingRole: null, authError: null, authNotice: null })
      },
    }),
    {
      name: 'orbit-auth-v1',
      partialize: (s) => ({ session: s.session }),
    },
  ),
)
