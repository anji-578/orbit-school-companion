#!/usr/bin/env node
/**
 * Deletes PILOT100 school data + Auth users with @pilot100.orbit.app emails.
 *   node scripts/teardown-pilot100.mjs
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
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
    if (!process.env[m[1]]) process.env[m[1]] = val
  }
}

loadEnv()
const url = (process.env.VITE_SUPABASE_URL || '').trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const { data: school } = await admin.from('schools').select('id').eq('code', 'PILOT100').maybeSingle()
if (school?.id) {
  const sid = school.id
  console.log('Deleting school rows', sid)
  // Cascade from school delete covers most child tables with ON DELETE CASCADE
  await admin.from('schools').delete().eq('id', sid)
}

let deleted = 0
for (let page = 1; page <= 20; page++) {
  const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 })
  const users = (data?.users || []).filter((u) => (u.email || '').endsWith('@pilot100.orbit.app'))
  if (!data?.users?.length) break
  for (const u of users) {
    const { error } = await admin.auth.admin.deleteUser(u.id)
    if (!error) deleted += 1
    else console.warn(u.email, error.message)
  }
}

console.log(JSON.stringify({ authUsersDeleted: deleted, schoolDeleted: Boolean(school?.id) }, null, 2))
console.log('PILOT100 teardown complete.')
