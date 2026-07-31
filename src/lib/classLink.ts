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
  // Teachers / school admins: linked if profile has school_id
  const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle()
  return Boolean(profile?.school_id)
}
