import { getSupabase, isSupabaseConfigured } from './supabase'
import { DEMO_USERS } from '../auth/demoUsers'

/**
 * Sunrise demo personas only (`*@orbit.app` fixture accounts).
 * Never treat PILOT100 (`*@pilot100.orbit.app`) as demo masquerade.
 */
export function isPilotDemoEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  if (normalized.endsWith('@pilot100.orbit.app')) return false
  return DEMO_USERS.some((u) => u.email === normalized)
}

export async function resolveClassLinked(email: string, role: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true
  if (isPilotDemoEmail(email)) return true

  const supabase = getSupabase()
  if (!supabase) return false

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return false

  if (role === 'student') {
    const { data } = await supabase.from('students').select('id').eq('profile_id', user.id).maybeSingle()
    return Boolean(data?.id)
  }
  if (role === 'parent') {
    const { data } = await supabase.from('parent_links').select('id').eq('parent_profile_id', user.id).limit(1)
    return Boolean(data?.length)
  }
  const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle()
  return Boolean(profile?.school_id)
}

export async function redeemInviteCode(
  code: string,
): Promise<{ ok: true; className?: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Connect Supabase to redeem invite codes.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const trimmed = code.trim()
  if (!trimmed) return { ok: false, error: 'Enter an invite code.' }

  const { data, error } = await supabase.rpc('redeem_class_invite', { invite_code: trimmed })
  if (error) return { ok: false, error: error.message }

  const result = data as { ok?: boolean; error?: string; class_name?: string } | null
  if (!result?.ok) {
    return { ok: false, error: result?.error || 'Could not redeem invite.' }
  }
  return { ok: true, className: result.class_name }
}

export async function fetchSchoolInviteCodes(): Promise<{ code: string; role: string; className: string | null; uses: string }[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('class_invites')
    .select('code, role, class_name, use_count, max_uses, active')
    .eq('active', true)
    .order('role')
  if (error || !data) return []
  return data.map((row) => ({
    code: row.code as string,
    role: row.role as string,
    className: (row.class_name as string) || null,
    uses: `${row.use_count}/${row.max_uses}`,
  }))
}

const ROLE_PREFIX: Record<string, string> = {
  student: 'STU',
  parent: 'PAR',
  teacher: 'TCH',
  school: 'ADM',
}

export async function createClassInvite(input: {
  role: 'student' | 'parent' | 'teacher' | 'school'
  className?: string
  studentId?: string
  maxUses?: number
}): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Connect Supabase to create invite codes.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return { ok: false, error: 'Not signed in.' }

  const { data: profile } = await supabase.from('profiles').select('school_id, role').eq('id', user.id).maybeSingle()
  if (profile?.role !== 'school' || !profile.school_id) {
    return { ok: false, error: 'Only school admins can create invites.' }
  }

  const { data: school } = await supabase
    .from('schools')
    .select('id, code')
    .eq('id', profile.school_id as string)
    .maybeSingle()
  if (!school?.id) return { ok: false, error: 'School not found.' }

  const prefix = ROLE_PREFIX[input.role] ?? 'INV'
  const classSlug = (input.className || 'CLASS').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'CLS'
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  const code = `${(school.code as string) || 'SCHOOL'}-${prefix}-${classSlug}-${suffix}`

  const { error } = await supabase.from('class_invites').insert({
    code,
    school_id: school.id as string,
    role: input.role,
    student_id: input.studentId || null,
    class_name: input.className?.trim() || null,
    max_uses: input.maxUses ?? 20,
    active: true,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, code }
}
