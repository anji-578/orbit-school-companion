import type { User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

/**
 * Local session user — no Auth server round-trip.
 * Prefer this on hydrate / read paths. Use getUser() only when verifying the JWT.
 */
export async function getCachedAuthUser(): Promise<User | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}
