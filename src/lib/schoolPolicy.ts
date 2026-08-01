import { getSupabase, isSupabaseConfigured } from './supabase'

const POLICY_KEY = 'orbit_school_policy_v1'

/** Demo bootstrap only — never hardcode into product queries when profile has a school. */
export const DEMO_SCHOOL_CODE =
  (import.meta.env.VITE_DEFAULT_SCHOOL_CODE as string | undefined)?.trim() || 'SUNRISE'

export const DEMO_CLASS_LABEL =
  (import.meta.env.VITE_DEFAULT_CLASS_NAME as string | undefined)?.trim() || 'Grade 8-A'

export type SchoolPolicy = {
  classLabel: string
}

export function readSchoolPolicy(): SchoolPolicy {
  try {
    const raw = localStorage.getItem(POLICY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SchoolPolicy>
      if (typeof parsed.classLabel === 'string' && parsed.classLabel.trim()) {
        return { classLabel: parsed.classLabel.trim() }
      }
    }
  } catch {
    /* ignore */
  }
  return { classLabel: DEMO_CLASS_LABEL }
}

export function writeSchoolPolicy(next: Partial<SchoolPolicy>): SchoolPolicy {
  const merged = { ...readSchoolPolicy(), ...next }
  if (merged.classLabel) merged.classLabel = merged.classLabel.trim() || DEMO_CLASS_LABEL
  localStorage.setItem(POLICY_KEY, JSON.stringify(merged))
  return merged
}

/** Prefer profile.school_id; fall back to demo school code only for empty profiles. */
export async function resolveSchoolId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.school_id) return profile.school_id as string
  }

  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('code', DEMO_SCHOOL_CODE)
    .maybeSingle()
  return (school?.id as string | undefined) ?? null
}

/** Active class label: override → linked student → school policy → demo default. */
export function resolveClassLabel(options?: {
  override?: string | null
  linkedClassName?: string | null
  linkedSection?: string | null
}): string {
  if (options?.override?.trim()) return options.override.trim()
  const linkedName = options?.linkedClassName?.trim()
  const linkedSection = options?.linkedSection?.trim()
  if (linkedName && linkedSection) return `${linkedName}-${linkedSection}`
  if (linkedName) return linkedName
  return readSchoolPolicy().classLabel
}
