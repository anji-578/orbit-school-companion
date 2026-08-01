import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'

export type TeacherClassRow = {
  id: string
  teacherProfileId: string
  className: string
  section: string | null
}

export type TeacherProfileOption = {
  id: string
  name: string
  email: string
}

export async function fetchSchoolTeachers(): Promise<TeacherProfileOption[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .order('display_name')
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id as string,
    name: (row.display_name as string) || (row.email as string) || 'Teacher',
    email: (row.email as string) || '',
  }))
}

export async function fetchTeacherClasses(): Promise<TeacherClassRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('teacher_classes')
    .select('id, teacher_profile_id, class_name, section')
    .order('class_name')
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id as string,
    teacherProfileId: row.teacher_profile_id as string,
    className: row.class_name as string,
    section: (row.section as string | null) ?? null,
  }))
}

export async function assignTeacherClass(input: {
  teacherProfileId: string
  className: string
  section?: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }
  const className = input.className.trim()
  if (!input.teacherProfileId || !className) {
    return { ok: false, error: 'Teacher and class are required' }
  }
  const { error } = await supabase.from('teacher_classes').upsert(
    {
      school_id: schoolId,
      teacher_profile_id: input.teacherProfileId,
      class_name: className,
      section: input.section?.trim() || null,
    },
    { onConflict: 'teacher_profile_id,class_name,section' },
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function removeTeacherClass(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const { error } = await supabase.from('teacher_classes').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
