import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'
import { schoolTeachers } from '../data/demo'
import type { TeacherProfile } from '../types'


/** Live staff_directory rows only — empty means store should keep sample teacher cards. */
export async function fetchStaffDirectory(): Promise<TeacherProfile[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []

  const { data, error } = await supabase
    .from('staff_directory')
    .select('id, display_name, subject_key, qualification, phone, avatar_url')
    .eq('school_id', schoolId)
    .order('display_name', { ascending: true })

  if (error || !data?.length) return []

  return data.map((row) => ({
    id: row.id as string,
    name: row.display_name as string,
    subjectKey: (row.subject_key as string) || 'mathSubject',
    qualification: (row.qualification as string) || '',
    phone: (row.phone as string) || '',
    avatar: (row.avatar_url as string) || schoolTeachers[0]?.avatar || '',
  }))
}
