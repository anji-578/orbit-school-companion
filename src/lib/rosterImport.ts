import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'
import type { RosterStudent } from '../types'
import { fetchRosterWithTodayAttendance } from './attendanceApi'
import { writeAuditLog } from './auditApi'

export type RosterCsvRow = {
  displayName: string
  className: string
  /** Empty string means no section (stored as null) — never invent "A". */
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
      section: (sectionIdx >= 0 ? cols[sectionIdx] : '')?.trim() || '',
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

function rosterKey(className: string, section: string | null | undefined, rollNo: string) {
  return `${className.trim().toLowerCase()}|${(section || '').trim().toLowerCase()}|${rollNo.trim().toLowerCase()}`
}

/**
 * Import CSV with upsert by (class_name, section, roll_no) within the school.
 * Re-imports update display_name / reactivate; new rows insert.
 */
export async function importRosterCsv(
  fileText: string,
): Promise<{ ok: true; imported: number; updated: number; roster: RosterStudent[] } | { ok: false; error: string }> {
  const parsed = parseRosterCsv(fileText)
  if (parsed.error) return { ok: false, error: parsed.error }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Connect Supabase to import roster into the school database.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found.' }

  const { data: existing, error: existingErr } = await supabase
    .from('students')
    .select('id, class_name, section, roll_no')
    .eq('school_id', schoolId)
  if (existingErr) return { ok: false, error: existingErr.message }

  const byKey = new Map(
    (existing ?? []).map((row) => [
      rosterKey(
        (row.class_name as string) || '',
        (row.section as string | null) ?? null,
        row.roll_no != null ? String(row.roll_no) : '',
      ),
      row.id as string,
    ]),
  )

  const toInsert: Array<{
    school_id: string
    display_name: string
    class_name: string
    section: string | null
    roll_no: string
    active: boolean
  }> = []
  let updated = 0

  for (const r of parsed.rows) {
    const key = rosterKey(r.className, r.section || null, r.rollNo)
    const id = byKey.get(key)
    if (id) {
      const { error } = await supabase
        .from('students')
        .update({
          display_name: r.displayName,
          active: true,
        })
        .eq('id', id)
      if (error) return { ok: false, error: error.message }
      updated += 1
    } else {
      toInsert.push({
        school_id: schoolId,
        display_name: r.displayName,
        class_name: r.className,
        section: r.section || null,
        roll_no: r.rollNo,
        active: true,
      })
    }
  }

  if (toInsert.length) {
    const { error } = await supabase.from('students').insert(toInsert)
    if (error) return { ok: false, error: error.message }
  }

  void writeAuditLog({
    action: 'roster.import',
    entityType: 'students',
    payload: { imported: toInsert.length, updated },
  })

  const roster = await fetchRosterWithTodayAttendance({
    activeClassOnly: false,
    includeInactive: true,
  })
  return { ok: true, imported: toInsert.length, updated, roster }
}

export const ROSTER_CSV_TEMPLATE = `display_name,class_name,section,roll_no
Ananya Rao,Grade 8,A,14
Sarah Chen,Grade 8,A,15
Marcus Johnson,Grade 8,A,16
`
