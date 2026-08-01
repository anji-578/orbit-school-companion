import { isSupabaseConfigured } from './supabaseConfig'

/**
 * Prefer live remote rows. Sample fallback is demo-only (no Supabase).
 * When cloud is configured, empty remote means empty — never invent demo data.
 */
export function withSample<T>(
  remote: T[] | null | undefined,
  sample: T[],
  options?: { forceSample?: boolean },
): T[] {
  if (remote && remote.length > 0) return remote
  if (options?.forceSample) return sample
  if (isSupabaseConfigured()) return remote ?? []
  return sample
}

export function timetableHasSlots(week: Record<string, { theory: unknown[]; lab: unknown[] }> | null | undefined) {
  if (!week) return false
  return Object.values(week).some((d) => (d?.theory?.length ?? 0) + (d?.lab?.length ?? 0) > 0)
}
