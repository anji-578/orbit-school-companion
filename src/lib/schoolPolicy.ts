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

/** Load active class from Supabase; cache locally. Falls back to local/demo. */
export async function fetchSchoolPolicy(): Promise<SchoolPolicy> {
  const local = readSchoolPolicy()
  if (!isSupabaseConfigured()) return local
  const supabase = getSupabase()
  if (!supabase) return local
  const schoolId = await resolveSchoolId()
  if (!schoolId) return local

  const { data, error } = await supabase
    .from('school_policy')
    .select('active_class_label')
    .eq('school_id', schoolId)
    .maybeSingle()

  if (error || !data?.active_class_label) return local
  return writeSchoolPolicy({ classLabel: String(data.active_class_label) })
}

/** Persist active class locally + to Supabase (school/teacher). */
export async function saveSchoolPolicy(
  next: Partial<SchoolPolicy>,
): Promise<{ ok: boolean; policy: SchoolPolicy; error?: string }> {
  const policy = writeSchoolPolicy(next)
  if (!isSupabaseConfigured()) return { ok: true, policy }
  const supabase = getSupabase()
  if (!supabase) return { ok: true, policy }

  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, policy, error: 'School not found' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('school_policy').upsert(
    {
      school_id: schoolId,
      active_class_label: policy.classLabel,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    },
    { onConflict: 'school_id' },
  )

  if (error) return { ok: false, policy, error: error.message }
  return { ok: true, policy }
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

/** Normalize "Grade 8" + "A" / "Grade 8-A" style labels for matching. */
export function classLabelsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const norm = (v: string) =>
    v
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\s*-\s*/g, '-')
  const left = norm(a || '')
  const right = norm(b || '')
  if (!left || !right) return false
  return left === right
}
