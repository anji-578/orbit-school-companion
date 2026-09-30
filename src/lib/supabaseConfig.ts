/**
 * Supabase client stub — activate when you add credentials to .env:
 *   VITE_SUPABASE_URL=
 *   VITE_SUPABASE_ANON_KEY=
 *
 * Until then, auth uses local demo users in auth/demoUsers.ts
 *
 * Always use static import.meta.env.VITE_* access (never assign import.meta.env).
 */
export function isSupabaseConfigured(): boolean {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || ''
  const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || ''
  return Boolean(url && anon)
}

export function getSupabaseConfig() {
  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '',
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '',
  }
}
