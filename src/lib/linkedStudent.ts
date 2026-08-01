import { getSupabase, isSupabaseConfigured } from './supabase'
import { DEMO_STUDENT_IDS } from './attendanceApi'
import { isPilotDemoEmail } from './classLink'

const ACTIVE_KEY = 'orbit_active_student_id'

export type LinkedStudent = {
  id: string
  displayName: string
  className: string
  section: string | null
}

export function getActiveStudentIdPreference(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

export function setActiveStudentIdPreference(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id)
  } catch {
    /* ignore */
  }
}

function mapStudentRow(data: {
  id: string
  display_name?: string | null
  class_name?: string | null
  section?: string | null
}): LinkedStudent {
  return {
    id: data.id,
    displayName: data.display_name || 'Student',
    className: data.class_name || '',
    section: data.section || null,
  }
}

const DEMO_CHILDREN: LinkedStudent[] = [
  { id: DEMO_STUDENT_IDS.ananya, displayName: 'Ananya Rao', className: 'Grade 8', section: 'A' },
  { id: DEMO_STUDENT_IDS.sarah, displayName: 'Sarah Chen', className: 'Grade 8', section: 'A' },
]

/** All children linked to the signed-in parent (or self for student). */
export async function fetchLinkedStudents(sessionEmail: string, role: string): Promise<LinkedStudent[]> {
  if (!isSupabaseConfigured()) {
    if (role === 'parent') return DEMO_CHILDREN
    if (role === 'student') return [DEMO_CHILDREN[0]]
    return []
  }

  const supabase = getSupabase()
  if (!supabase) return []

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    if (isPilotDemoEmail(sessionEmail) && (role === 'parent' || role === 'student')) {
      return role === 'parent' ? DEMO_CHILDREN : [DEMO_CHILDREN[0]]
    }
    return []
  }

  if (role === 'student') {
    const { data: mine } = await supabase
      .from('students')
      .select('id, display_name, class_name, section')
      .eq('profile_id', user.id)
      .maybeSingle()
    if (mine) return [mapStudentRow(mine as LinkedStudent & { display_name: string; class_name: string; section: string })]
    if (isPilotDemoEmail(sessionEmail)) return [DEMO_CHILDREN[0]]
    return []
  }

  if (role !== 'parent') return []

  const { data: links } = await supabase
    .from('parent_links')
    .select('student_id, students(id, display_name, class_name, section)')
    .eq('parent_profile_id', user.id)

  const fromLinks: LinkedStudent[] = []
  for (const row of links ?? []) {
    const student = row.students as
      | { id: string; display_name?: string; class_name?: string; section?: string | null }
      | { id: string; display_name?: string; class_name?: string; section?: string | null }[]
      | null
    const s = Array.isArray(student) ? student[0] : student
    if (s?.id) fromLinks.push(mapStudentRow(s))
  }

  if (fromLinks.length) return fromLinks

  if (isPilotDemoEmail(sessionEmail)) return DEMO_CHILDREN
  return []
}

/** Pick active child: preference → first linked → null. */
export function pickActiveStudent(
  students: LinkedStudent[],
  preferredId?: string | null,
): LinkedStudent | null {
  if (!students.length) return null
  const pref = preferredId || getActiveStudentIdPreference()
  if (pref) {
    const match = students.find((s) => s.id === pref)
    if (match) return match
  }
  return students[0]
}

/** Linked child for parent/student; prefers active child preference. */
export async function resolveLinkedStudentId(preferredId?: string | null): Promise<string | null> {
  if (!isSupabaseConfigured()) return preferredId || getActiveStudentIdPreference() || DEMO_STUDENT_IDS.ananya
  const supabase = getSupabase()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return null

  const { data: mine } = await supabase.from('students').select('id').eq('profile_id', user.id).maybeSingle()
  if (mine?.id) return mine.id as string

  const { data: links } = await supabase
    .from('parent_links')
    .select('student_id')
    .eq('parent_profile_id', user.id)

  const ids = (links ?? []).map((l) => l.student_id as string).filter(Boolean)
  if (!ids.length) return null
  const pref = preferredId || getActiveStudentIdPreference()
  if (pref && ids.includes(pref)) return pref
  return ids[0]
}

/** Full linked student row for UI labels. */
export async function fetchLinkedStudent(sessionEmail: string, role: string): Promise<LinkedStudent | null> {
  const all = await fetchLinkedStudents(sessionEmail, role)
  return pickActiveStudent(all)
}

/** Prefer linked child name; fallback for local demo. */
export function childDisplayName(linked: LinkedStudent | null, fallback = 'Ananya Rao') {
  return linked?.displayName || fallback
}

export function childFirstName(linked: LinkedStudent | null, fallback = 'Ananya') {
  return childDisplayName(linked, fallback).split(' ')[0]
}
