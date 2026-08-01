import { getSupabase, isSupabaseConfigured } from './supabase'
import type { RosterStudent } from '../types'
import { fetchRosterWithTodayAttendance } from './attendanceApi'

export type RosterCsvRow = {
  displayName: string
  className: string
  section: string
  rollNo: string
}

/** Parse simple CSV: display_name,class_name,section,roll_no (header required). */
export function parseRosterCsv(text: string): { rows: RosterCsvRow[]; error?: string } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) {
    return { rows: [], error: 'CSV needs a header row and at least one student.' }
  }

  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const nameIdx = header.findIndex((h) => ['display_name', 'name', 'student_name'].includes(h))
  const classIdx = header.findIndex((h) => ['class_name', 'class', 'grade'].includes(h))
  const sectionIdx = header.findIndex((h) => ['section', 'sec'].includes(h))
  const rollIdx = header.findIndex((h) => ['roll_no', 'roll', 'roll_number'].includes(h))

  if (nameIdx < 0) {
    return { rows: [], error: 'Missing display_name (or name) column.' }
  }

  const rows: RosterCsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]!)
    const displayName = (cols[nameIdx] || '').trim()
    if (!displayName) continue
    rows.push({
      displayName,
      className: (classIdx >= 0 ? cols[classIdx] : '')?.trim() || 'Grade 8',
      section: (sectionIdx >= 0 ? cols[sectionIdx] : '')?.trim() || 'A',
      rollNo: (rollIdx >= 0 ? cols[rollIdx] : '')?.trim() || String(i),
    })
  }

  if (!rows.length) return { rows: [], error: 'No student rows found.' }
  return { rows }
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

async function sunriseSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
}

export async function importRosterCsv(
  fileText: string,
): Promise<{ ok: true; imported: number; roster: RosterStudent[] } | { ok: false; error: string }> {
  const parsed = parseRosterCsv(fileText)
  if (parsed.error) return { ok: false, error: parsed.error }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Connect Supabase to import roster into the school database.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const schoolId = await sunriseSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found.' }

  const payload = parsed.rows.map((r) => ({
    school_id: schoolId,
    display_name: r.displayName,
    class_name: r.className,
    section: r.section,
    roll_no: r.rollNo,
  }))

  const { error } = await supabase.from('students').insert(payload)
  if (error) return { ok: false, error: error.message }

  const roster = await fetchRosterWithTodayAttendance()
  return { ok: true, imported: payload.length, roster }
}

export const ROSTER_CSV_TEMPLATE = `display_name,class_name,section,roll_no
Ananya Rao,Grade 8,A,14
Sarah Chen,Grade 8,A,15
Marcus Johnson,Grade 8,A,16
`
