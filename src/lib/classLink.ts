import { getSupabase, isSupabaseConfigured } from './supabase'
import { DEMO_USERS } from '../auth/demoUsers'

/** Whether this account should see live class data vs “ask school for invite”. */
export function isPilotDemoEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  return DEMO_USERS.some((u) => u.email === normalized) || normalized.endsWith('@orbit.app')
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
