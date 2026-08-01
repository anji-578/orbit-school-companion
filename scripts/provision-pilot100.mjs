#!/usr/bin/env node
/**
 * Creates Auth users + profiles + parent_links + student profile claims for PILOT100.
 * Requires: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 *
 *   node scripts/generate-pilot100.mjs
 *   # apply supabase/pilot100_seed.sql first
 *   node scripts/provision-pilot100.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

function loadEnv() {
  const envPath = join(root, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/)
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQ = !inQ
      } else if (ch === ',' && !inQ) {
        cols.push(cur)
        cur = ''
      } else cur += ch
    }
    cols.push(cur)
    const row = {}
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? ''
    })
    return row
  })
}

loadEnv()

const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const fixtureDir = join(root, 'fixtures', 'pilot100')
const logins = parseCsv(readFileSync(join(fixtureDir, 'login_directory.csv'), 'utf8'))
const links = parseCsv(readFileSync(join(fixtureDir, 'parent_child_links.csv'), 'utf8'))

const { data: school, error: schoolErr } = await admin
  .from('schools')
  .select('id')
  .eq('code', 'PILOT100')
  .maybeSingle()

if (schoolErr || !school?.id) {
  console.error('PILOT100 school missing — run supabase/pilot100_seed.sql first')
  process.exit(1)
}

const schoolId = school.id
console.log('School', schoolId)

async function upsertUser(row) {
  const email = row.email.trim().toLowerCase()
  const password = row.password || 'Pilot100!'
  const role = row.role
  const displayName = row.display_name || email

  const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  let user = listed?.users?.find((u) => (u.email || '').toLowerCase() === email)

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, display_name: displayName, subtitle: 'PILOT100' },
    })
    if (error) {
      // retry list in case of race
      const { data: listed2 } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      user = listed2?.users?.find((u) => (u.email || '').toLowerCase() === email)
      if (!user) throw new Error(`${email}: ${error.message}`)
    } else {
      user = data.user
    }
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { role, display_name: displayName, subtitle: 'PILOT100' },
    })
  }

  const { error: profileErr } = await admin.from('profiles').upsert(
    {
      id: user.id,
      school_id: schoolId,
      role,
      display_name: displayName,
      subtitle: 'PILOT100',
      email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (profileErr) throw new Error(`profile ${email}: ${profileErr.message}`)

  if (role === 'student' && row.student_id) {
    const { error } = await admin
      .from('students')
      .update({ profile_id: user.id })
      .eq('id', row.student_id)
      .eq('school_id', schoolId)
    if (error) console.warn('claim student', email, error.message)
  }

  return user
}

// Auth listUsers only returns 1000 — for PILOT100 we create ~200, so create sequentially
// and avoid relying on full list after many creates. Prefer getUserByEmail if available.
async function findUserByEmail(email) {
  // Supabase JS v2 admin has listUsers pagination; use filter via generateLink trick fallback
  for (let page = 1; page <= 5; page++) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    const hit = data?.users?.find((u) => (u.email || '').toLowerCase() === email)
    if (hit) return hit
    if (!data?.users?.length) break
  }
  return null
}

async function upsertUserFast(row) {
  const email = row.email.trim().toLowerCase()
  const password = row.password || 'Pilot100!'
  const role = row.role
  const displayName = row.display_name || email

  let user = await findUserByEmail(email)
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, display_name: displayName, subtitle: 'PILOT100' },
    })
    if (error) {
      user = await findUserByEmail(email)
      if (!user) throw new Error(`${email}: ${error.message}`)
    } else user = data.user
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { role, display_name: displayName, subtitle: 'PILOT100' },
    })
  }

  const { error: profileErr } = await admin.from('profiles').upsert(
    {
      id: user.id,
      school_id: schoolId,
      role,
      display_name: displayName,
      subtitle: 'PILOT100',
      email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (profileErr) throw new Error(`profile ${email}: ${profileErr.message}`)

  if (role === 'student' && row.student_id) {
    await admin.from('students').update({ profile_id: user.id }).eq('id', row.student_id)
  }
  return user
}

const parentUsers = new Map()
let ok = 0
let fail = 0

for (const row of logins) {
  try {
    const user = await upsertUserFast(row)
    if (row.role === 'parent') parentUsers.set(row.email.toLowerCase(), user.id)
    ok += 1
    if (ok % 20 === 0) console.log(`… ${ok}/${logins.length}`)
  } catch (err) {
    fail += 1
    console.error('FAIL', row.email, err.message)
  }
}

console.log('Linking parents…')
for (const link of links) {
  const parentProfileId = parentUsers.get(link.parent_email.toLowerCase())
  if (!parentProfileId) {
    console.warn('skip link, parent missing', link.parent_email)
    continue
  }
  const { error } = await admin.from('parent_links').upsert(
    {
      parent_profile_id: parentProfileId,
      student_id: link.student_id,
      relationship: link.relationship || 'guardian',
    },
    { onConflict: 'parent_profile_id,student_id' },
  )
  if (error) console.warn('link', link.parent_email, error.message)
}

console.log(JSON.stringify({ ok, fail, parentsLinked: links.length, schoolId }, null, 2))
console.log('Quick logins:')
console.log('  school  admin@pilot100.orbit.app / Pilot100!')
console.log('  teacher teacher01@pilot100.orbit.app / Pilot100!')
console.log('  parent  parent001@pilot100.orbit.app / Pilot100!')
console.log('  student student001@pilot100.orbit.app / Pilot100!')
