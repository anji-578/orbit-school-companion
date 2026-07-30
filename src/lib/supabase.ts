import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig, isSupabaseConfigured } from './supabaseConfig'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (client) return client
  const { url, anonKey } = getSupabaseConfig()
  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}

export { isSupabaseConfigured }
