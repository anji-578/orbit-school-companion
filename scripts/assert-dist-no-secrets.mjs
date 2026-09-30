#!/usr/bin/env node
/**
 * Fail CI if production dist/ contains secret-shaped material.
 * Does not print matches (only pattern names + file basenames).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')

const patterns = [
  { name: 'google_api_key_AIza', re: /AIza[0-9A-Za-z_-]{20,}/g },
  { name: 'google_api_key_AQ', re: /AQ\.[A-Za-z0-9_-]{20,}/g },
  { name: 'vite_gemini_env', re: /VITE_GEMINI_API_KEY/g },
  { name: 'service_role_literal', re: /service_role/g },
  { name: 'supabase_service_role_jwt', re: /eyJ[A-Za-z0-9_-]+\.eyJ[^"]*service_role/g },
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(js|css|html|map)$/.test(name)) out.push(p)
  }
  return out
}

let failed = false
for (const file of walk(dist)) {
  const text = readFileSync(file, 'utf8')
  for (const { name, re } of patterns) {
    re.lastIndex = 0
    if (re.test(text)) {
      failed = true
      console.error(`[dist-secrets] FAIL pattern=${name} file=${file.split('/').pop()}`)
    }
  }
}

if (failed) {
  console.error('[dist-secrets] Production bundle must not embed API keys or service_role material.')
  process.exit(1)
}
console.log('[dist-secrets] OK — no forbidden secret patterns in dist/')
