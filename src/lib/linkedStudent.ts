import { getSupabase, isSupabaseConfigured } from './supabase'
import { DEMO_STUDENT_IDS } from './attendanceApi'
import { isPilotDemoEmail } from './classLink'

export type LinkedStudent = {
  id: string
  displayName: string
  className: string
  section: string | null
}

/** Linked child for parent/student; null when unlinked. */
export async function resolveLinkedStudentId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return null

  const { data: mine } = await supabase.from('students').select('id').eq('profile_id', user.id).maybeSingle()
  if (mine?.id) return mine.id as string

  const { data: linked } = await supabase
    .from('parent_links')
    .select('student_id')
    .eq('parent_profile_id', user.id)
    .limit(1)
    .maybeSingle()
  if (linked?.student_id) return linked.student_id as string

  return null
}

/** Full linked student row for UI labels. Pilot demo emails fall back to Ananya. */
export async function fetchLinkedStudent(sessionEmail: string, role: string): Promise<LinkedStudent | null> {
  if (!isSupabaseConfigured()) {
    return {
      id: DEMO_STUDENT_IDS.ananya,
      displayName: 'Ananya Rao',
      className: 'Grade 8',
      section: 'A',
    }
  }

  const supabase = getSupabase()
  if (!supabase) return null

  let studentId: string | null = null
  if (role === 'student' || role === 'parent') {
    studentId = await resolveLinkedStudentId()
  }

  if (!studentId && isPilotDemoEmail(sessionEmail) && (role === 'student' || role === 'parent')) {
    studentId = DEMO_STUDENT_IDS.ananya
  }

  if (!studentId) return null

  const { data } = await supabase
    .from('students')
    .select('id, display_name, class_name, section')
    .eq('id', studentId)
    .maybeSingle()

  if (!data) {
    if (studentId === DEMO_STUDENT_IDS.ananya) {
      return { id: studentId, displayName: 'Ananya Rao', className: 'Grade 8', section: 'A' }
    }
    return null
  }

  return {
    id: data.id as string,
    displayName: (data.display_name as string) || 'Student',
    className: (data.class_name as string) || '',
    section: (data.section as string) || null,
  }
}

/** Prefer linked child name; fallback for local demo. */
export function childDisplayName(linked: LinkedStudent | null, fallback = 'Ananya Rao') {
  return linked?.displayName || fallback
}

export function childFirstName(linked: LinkedStudent | null, fallback = 'Ananya') {
  return childDisplayName(linked, fallback).split(' ')[0]
}
