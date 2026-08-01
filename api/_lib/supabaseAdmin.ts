import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

export function getAdmin(): SupabaseClient | null {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function requireUser(
  req: Request,
  admin: SupabaseClient,
): Promise<{ user: User } | { error: string; status: number }> {
  const authHeader = req.headers.get('Authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!bearer) return { error: 'Unauthorized', status: 401 }
  const { data, error } = await admin.auth.getUser(bearer)
  if (error || !data.user?.id) return { error: 'Unauthorized', status: 401 }
  return { user: data.user }
}

export async function loadProfile(admin: SupabaseClient, userId: string) {
  const { data } = await admin
    .from('profiles')
    .select('id, role, school_id, email, display_name')
    .eq('id', userId)
    .maybeSingle()
  return data as
    | { id: string; role: string; school_id: string | null; email: string | null; display_name: string | null }
    | null
}
