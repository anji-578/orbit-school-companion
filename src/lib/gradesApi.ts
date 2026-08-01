import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'
import type { StudentGrade } from '../types'
import { DEMO_STUDENT_IDS } from './attendanceApi'
import { resolveLinkedStudentId } from './linkedStudent'


async function currentRole(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return null
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return (data?.role as string | undefined) ?? null
}

export async function fetchStudentGrades(linkedStudentId?: string | null): Promise<StudentGrade[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []

  const role = await currentRole()
  let studentId = linkedStudentId ?? null
  if (!studentId && (role === 'parent' || role === 'student')) {
    studentId = await resolveLinkedStudentId()
  }

  let query = supabase
    .from('student_grades')
    .select('id, student_id, student_name, math, science, chem, comment')
    .eq('school_id', schoolId)

  if (studentId) {
    query = query.eq('student_id', studentId)
  } else if (role === 'parent' || role === 'student') {
    return []
  }

  const { data } = await query.order('student_name', { ascending: true })

  if (!data?.length) return []
  return data.map((row) => ({
    id: row.id as string,
    name: row.student_name as string,
    math: (row.math as string) || '',
    science: (row.science as string) || '',
    chem: (row.chem as string) || '',
    comment: (row.comment as string) || '',
  }))
}

export async function saveStudentGrades(grades: StudentGrade[]): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const studentId = await resolveLinkedStudentId()

  const rows = grades.map((g) => ({
    id: g.id,
    school_id: schoolId,
    student_id: studentId || DEMO_STUDENT_IDS.ananya,
    student_name: g.name,
    math: g.math,
    science: g.science,
    chem: g.chem,
    comment: g.comment,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('student_grades').upsert(rows, { onConflict: 'id' })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
