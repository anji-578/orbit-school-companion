import type { Role } from '../types'
import { DEMO_USERS } from './demoUsers'
import { getSupabase } from '../lib/supabase'

export interface OrbitProfile {
  id: string
  role: Role
  email: string
  displayName: string
  subtitle: string
}

const ROLES: Role[] = ['student', 'parent', 'teacher', 'school']

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value)
}

function demoMetaFor(role: Role, email: string) {
  const demo = DEMO_USERS.find((u) => u.role === role && u.email === email.trim().toLowerCase())
  return {
    displayName: demo?.displayName ?? email.split('@')[0] ?? 'Orbit User',
    subtitle: demo?.subtitle ?? `${role} profile`,
  }
}

async function fetchProfile(userId: string): Promise<Partial<OrbitProfile> | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, display_name, subtitle, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id as string,
    role: isRole(data.role) ? data.role : undefined,
    email: (data.email as string) ?? '',
    displayName: (data.display_name as string) ?? '',
    subtitle: (data.subtitle as string) ?? '',
  }
}

function sessionFromAuthUser(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  selectedRole: Role,
  profile: Partial<OrbitProfile> | null,
): OrbitProfile {
  const meta = user.user_metadata ?? {}
  const metaRole = isRole(meta.role) ? meta.role : null
  const role = profile?.role ?? metaRole ?? selectedRole
  const email = (profile?.email || user.email || '').toLowerCase()
  const defaults = demoMetaFor(role, email)
  return {
    id: user.id,
    role,
    email,
    displayName: profile?.displayName || String(meta.display_name ?? defaults.displayName),
    subtitle: profile?.subtitle || String(meta.subtitle ?? defaults.subtitle),
  }
}

/**
 * Sign in with email/password. If the user does not exist yet, auto-registers
 * (useful for first-run demo accounts). Ensures selected persona role matches.
 */
export async function supabaseLogin(
  selectedRole: Role,
  email: string,
  password: string,
): Promise<{ ok: true; profile: OrbitProfile } | { ok: false; error: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }

  const normalized = email.trim().toLowerCase()
  const meta = demoMetaFor(selectedRole, normalized)

  const signedIn = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  })

  let user = signedIn.data.user

  // First-time: create the account with role metadata (demo bootstrap)
  if (signedIn.error || !user) {
    const msg = (signedIn.error?.message ?? '').toLowerCase()
    const missing =
      msg.includes('invalid login') ||
      msg.includes('invalid credentials') ||
      msg.includes('user not found') ||
      !user

    if (signedIn.error && !missing) {
      return { ok: false, error: signedIn.error.message }
    }

    const signedUp = await supabase.auth.signUp({
      email: normalized,
      password,
      options: {
        data: {
          role: selectedRole,
          display_name: meta.displayName,
          subtitle: meta.subtitle,
        },
      },
    })

    if (signedUp.error) {
      return {
        ok: false,
        error: `Sign-in failed${signedIn.error ? `: ${signedIn.error.message}` : ''}. Auto-create failed: ${signedUp.error.message}`,
      }
    }

    user = signedUp.data.user
    if (!signedUp.data.session || !user) {
      const again = await supabase.auth.signInWithPassword({ email: normalized, password })
      if (again.error || !again.data.user) {
        return {
          ok: false,
          error:
            'Account created but email confirmation may be required. Disable “Confirm email” in Supabase Auth settings for demos, then retry.',
        }
      }
      user = again.data.user
    }
  }

  if (!user) return { ok: false, error: 'Sign-in succeeded but no user returned.' }

  const profileRow = await fetchProfile(user.id)
  const profile = sessionFromAuthUser(user, selectedRole, profileRow)

  if (profile.role !== selectedRole) {
    await supabase.auth.signOut()
    return {
      ok: false,
      error: `This account is registered as “${profile.role}”, not “${selectedRole}”. Pick the matching profile on the landing page.`,
    }
  }

  // Best-effort profile upsert when table exists
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      role: selectedRole,
      display_name: profile.displayName,
      subtitle: profile.subtitle,
      email: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  return { ok: true, profile }
}

export async function supabaseLogout(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function restoreSupabaseSession(): Promise<OrbitProfile | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return null
  const profileRow = await fetchProfile(user.id)
  const metaRole = isRole(user.user_metadata?.role) ? user.user_metadata.role : 'student'
  return sessionFromAuthUser(user, profileRow?.role ?? metaRole, profileRow)
}
