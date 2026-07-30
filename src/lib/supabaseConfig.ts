/**
 * Supabase client stub — activate when you add credentials to .env:
 *   VITE_SUPABASE_URL=
 *   VITE_SUPABASE_ANON_KEY=
 *
 * Until then, auth uses local demo users in auth/demoUsers.ts
 */
export function isSupabaseConfigured(): boolean {
  const env = import.meta.env as Record<string, string | undefined>
  return Boolean(env.VITE_SUPABASE_URL?.trim() && env.VITE_SUPABASE_ANON_KEY?.trim())
}

export function getSupabaseConfig() {
  const env = import.meta.env as Record<string, string | undefined>
  return {
    url: env.VITE_SUPABASE_URL?.trim() ?? '',
    anonKey: env.VITE_SUPABASE_ANON_KEY?.trim() ?? '',
  }
}
