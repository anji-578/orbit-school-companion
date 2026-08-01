#!/usr/bin/env node
/**
 * Writes supabase/pilot100_auth.sql from fixtures/pilot100/*.csv
 * (Auth users + profiles + parent_links). Does not talk to the network.
 *
 *   node scripts/generate-pilot100-auth-sql.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fixtureDir = join(root, 'fixtures', 'pilot100')

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

const logins = parseCsv(readFileSync(join(fixtureDir, 'login_directory.csv'), 'utf8'))
const links = parseCsv(readFileSync(join(fixtureDir, 'parent_child_links.csv'), 'utf8'))
const esc = (s) => String(s || '').replace(/'/g, "''")
const parts = []

parts.push('-- PILOT100 Auth + profiles + parent_links (password: Pilot100!)')
parts.push('-- Generated locally; apply after supabase/pilot100_seed.sql')
parts.push('create extension if not exists pgcrypto;')
parts.push('do $$')
parts.push('declare')
parts.push('  sid uuid;')
parts.push('  uid uuid;')
parts.push('  v_email text;')
parts.push("  v_pass text := crypt('Pilot100!', gen_salt('bf'));")
parts.push('begin')
parts.push("  select id into sid from public.schools where code = 'PILOT100';")
parts.push("  if sid is null then raise exception 'PILOT100 school missing — apply pilot100_seed.sql first'; end if;")

for (const row of logins) {
  const email = esc(row.email.trim().toLowerCase())
  const role = esc(row.role)
  const name = esc(row.display_name || row.email)
  const studentId = row.student_id ? `'${esc(row.student_id)}'::uuid` : 'null'
  parts.push(`  v_email := '${email}';`)
  parts.push('  select id into uid from auth.users where lower(email) = v_email;')
  parts.push('  if uid is null then')
  parts.push('    uid := gen_random_uuid();')
  parts.push('    insert into auth.users (')
  parts.push('      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,')
  parts.push('      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,')
  parts.push('      confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, reauthentication_token')
  parts.push('    ) values (')
  parts.push("      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', v_email, v_pass, now(),")
  parts.push(`      '{"provider":"email","providers":["email"]}'::jsonb,`)
  parts.push(`      jsonb_build_object('role','${role}','display_name','${name}','subtitle','PILOT100'),`)
  parts.push("      now(), now(), '', '', '', '', '', ''")
  parts.push('    );')
  parts.push('    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)')
  parts.push(
    "    values (gen_random_uuid(), uid, jsonb_build_object('sub', uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false), 'email', uid::text, now(), now(), now());",
  )
  parts.push('  else')
  parts.push('    update auth.users set encrypted_password = v_pass, email_confirmed_at = coalesce(email_confirmed_at, now()),')
  parts.push(
    `      raw_user_meta_data = jsonb_build_object('role','${role}','display_name','${name}','subtitle','PILOT100'), updated_at = now()`,
  )
  parts.push('    where id = uid;')
  parts.push('  end if;')
  parts.push('  insert into public.profiles (id, school_id, role, display_name, subtitle, email, updated_at)')
  parts.push(`  values (uid, sid, '${role}'::public.orbit_role, '${name}', 'PILOT100', v_email, now())`)
  parts.push(
    '  on conflict (id) do update set school_id = excluded.school_id, role = excluded.role, display_name = excluded.display_name, subtitle = excluded.subtitle, email = excluded.email, updated_at = now();',
  )
  if (row.role === 'student' && row.student_id) {
    parts.push(`  update public.students set profile_id = uid where id = ${studentId} and school_id = sid;`)
  }
}

parts.push('  delete from public.parent_links where student_id in (select id from public.students where school_id = sid);')
for (const link of links) {
  const email = esc(link.parent_email.trim().toLowerCase())
  const sidStu = esc(link.student_id)
  const rel = esc(link.relationship || 'guardian')
  parts.push('  insert into public.parent_links (parent_profile_id, student_id, relationship)')
  parts.push(`  select u.id, '${sidStu}'::uuid, '${rel}' from auth.users u where lower(u.email) = '${email}'`)
  parts.push('  on conflict (parent_profile_id, student_id) do update set relationship = excluded.relationship;')
}
parts.push('end $$;')

const out = join(root, 'supabase', 'pilot100_auth.sql')
writeFileSync(out, `${parts.join('\n')}\n`)
console.log('Wrote', out, `(${logins.length} logins, ${links.length} links)`)
if (!existsSync(join(fixtureDir, 'login_directory.csv'))) {
  console.error('Missing fixtures — run node scripts/generate-pilot100.mjs first')
  process.exit(1)
}
