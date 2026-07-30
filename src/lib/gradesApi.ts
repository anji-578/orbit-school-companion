import { getSupabase, isSupabaseConfigured } from './supabase'
import type { StudentGrade } from '../types'

async function sunriseSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
}

export async function fetchStudentGrades(): Promise<StudentGrade[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return []

  const { data } = await supabase
    .from('student_grades')
    .select('id, student_name, math, science, chem, comment')
    .eq('school_id', schoolId)
    .order('student_name', { ascending: true })

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
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const rows = grades.map((g) => ({
    id: g.id,
    school_id: schoolId,
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
