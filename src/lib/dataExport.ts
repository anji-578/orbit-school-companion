import { downloadBlob } from './receiptPdf'
import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'

function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  return [headers.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\n')
}

export async function exportAttendanceCsv(): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase not configured' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const { data, error } = await supabase
    .from('attendance')
    .select('date, status, reason, students(display_name, roll_no, class_name, section)')
    .eq('school_id', schoolId)
    .order('date', { ascending: false })
    .limit(2000)

  if (error) return { ok: false, error: error.message }
  const rows = (data ?? []).map((row) => {
    const student = row.students as
      | { display_name?: string; roll_no?: number | null; class_name?: string; section?: string }
      | null
      | Array<{ display_name?: string; roll_no?: number | null; class_name?: string; section?: string }>
    const s = Array.isArray(student) ? student[0] : student
    return [
      row.date as string,
      s?.display_name ?? '',
      s?.roll_no ?? '',
      s?.class_name && s?.section ? `${s.class_name}-${s.section}` : s?.class_name ?? '',
      row.status as string,
      (row.reason as string | null) ?? '',
    ]
  })

  const csv = toCsv(['date', 'student', 'roll_no', 'class', 'status', 'reason'], rows)
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `orbit-attendance-${new Date().toISOString().slice(0, 10)}.csv`)
  return { ok: true, count: rows.length }
}

export async function exportGradesCsv(): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase not configured' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const { data, error } = await supabase
    .from('student_grades')
    .select('student_name, math, science, chem, comment')
    .eq('school_id', schoolId)
    .order('student_name', { ascending: true })
    .limit(2000)

  if (error) return { ok: false, error: error.message }
  const rows = (data ?? []).map((row) => [
    row.student_name as string,
    row.math as string,
    row.science as string,
    row.chem as string,
    (row.comment as string | null) ?? '',
  ])

  const csv = toCsv(['student', 'math', 'science', 'chemistry', 'comment'], rows)
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `orbit-grades-${new Date().toISOString().slice(0, 10)}.csv`)
  return { ok: true, count: rows.length }
}
