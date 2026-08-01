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

export interface SignUpInput {
  email: string
  password: string
  displayName: string
  subtitle?: string
}

const ROLES: Role[] = ['student', 'parent', 'teacher', 'school']

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value)
}

function defaultSubtitle(role: Role) {
  const map: Record<Role, string> = {
    student: 'Student profile',
    parent: 'Parent / guardian',
    teacher: 'Teacher profile',
    school: 'School admin',
  }
  return map[role]
}

function demoMetaFor(role: Role, email: string) {
  const demo = DEMO_USERS.find((u) => u.role === role && u.email === email.trim().toLowerCase())
  return {
    displayName: demo?.displayName ?? email.split('@')[0] ?? 'Orbit User',
    subtitle: demo?.subtitle ?? defaultSubtitle(role),
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

async function upsertProfile(profile: OrbitProfile) {
  const supabase = getSupabase()
  if (!supabase) return
  const existing = await fetchProfile(profile.id)
  const stamp = new Date().toISOString()
  if (existing?.role) {
    // Never rewrite role/school_id — RLS locks both after first insert.
    await supabase
      .from('profiles')
      .update({
        display_name: profile.displayName,
        subtitle: profile.subtitle,
        email: profile.email,
        updated_at: stamp,
      })
      .eq('id', profile.id)
    return
  }
  await supabase.from('profiles').insert({
    id: profile.id,
    role: profile.role,
    display_name: profile.displayName,
    subtitle: profile.subtitle,
    email: profile.email,
    updated_at: stamp,
  })
}

function authErrorMessage(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('confirm') || msg.includes('not confirmed')) {
    return 'Email not confirmed. In Supabase → Authentication → Users, Confirm this user (or turn OFF Confirm email under Providers → Email).'
  }
  if (msg.includes('rate limit')) {
    return 'Auth email rate limit hit. Wait about an hour, confirm/delete pending users in Supabase, and avoid repeated sign-up clicks.'
  }
  return message
}

/** Create account in Supabase Auth (+ profiles row when schema exists). */
export async function supabaseSignUp(
  selectedRole: Role,
  input: SignUpInput,
): Promise<{ ok: true; profile: OrbitProfile } | { ok: false; error: string; needsConfirmation?: boolean }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }

  const email = input.email.trim().toLowerCase()
  const displayName = input.displayName.trim() || email.split('@')[0] || 'Orbit User'
  const subtitle = (input.subtitle ?? defaultSubtitle(selectedRole)).trim()

  if (input.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' }
  }

  const signedUp = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        role: selectedRole,
        display_name: displayName,
        subtitle,
      },
    },
  })

  if (signedUp.error) {
    return { ok: false, error: authErrorMessage(signedUp.error.message) }
  }

  const user = signedUp.data.user
  if (!user) {
    return { ok: false, error: 'Sign-up did not return a user.' }
  }

  // No session ⇒ email confirmation required
  if (!signedUp.data.session) {
    return {
      ok: false,
      needsConfirmation: true,
      error:
        'Account saved in Supabase, but email confirmation is ON. Confirm the user in Authentication → Users, or disable Confirm email, then Sign in.',
    }
  }

  const profile = sessionFromAuthUser(user, selectedRole, {
    displayName,
    subtitle,
    email,
    role: selectedRole,
  })
  await upsertProfile(profile)
  return { ok: true, profile }
}

/** Sign in only — does not auto-create accounts (use Sign up). */
export async function supabaseLogin(
  selectedRole: Role,
  email: string,
  password: string,
): Promise<{ ok: true; profile: OrbitProfile } | { ok: false; error: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }

  const normalized = email.trim().toLowerCase()
  const signedIn = await supabase.auth.signInWithPassword({
    email: normalized,
    password,
  })

  if (signedIn.error || !signedIn.data.user) {
    return {
      ok: false,
      error: authErrorMessage(signedIn.error?.message ?? 'Invalid email or password.'),
    }
  }

  const user = signedIn.data.user
  const profileRow = await fetchProfile(user.id)
  const profile = sessionFromAuthUser(user, selectedRole, profileRow)

  if (profile.role !== selectedRole) {
    await supabase.auth.signOut()
    return {
      ok: false,
      error: `This account is registered as “${profile.role}”, not “${selectedRole}”. Pick the matching profile on the landing page.`,
    }
  }

  await upsertProfile(profile)
  return { ok: true, profile }
}

export async function supabaseLogout(): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function supabaseRequestPasswordReset(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  const redirectTo = `${window.location.origin}/`
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo })
  if (error) return { ok: false, error: authErrorMessage(error.message) }
  return { ok: true }
}

export async function supabaseUpdatePassword(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' }
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { ok: false, error: authErrorMessage(error.message) }
  return { ok: true }
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
