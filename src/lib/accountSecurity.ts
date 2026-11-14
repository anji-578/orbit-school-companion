import { getSupabase } from './supabase'

export async function updateAccountPassword(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < 8) {
    return { ok: false, error: 'Use at least 8 characters' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Unavailable' }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
