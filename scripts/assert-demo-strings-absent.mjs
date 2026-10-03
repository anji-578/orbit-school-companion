#!/usr/bin/env node
/**
 * Fail production dist if forbidden demo identity/branding strings are present.
 * Checks string literals only (not identifier fragments).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const forbidden = [
  'Ananya Rao',
  'Sunrise Demo Academy',
  'Parent of Ananya',
  'Linear Equations',
  'Mrs. Sharma',
  'home-fx-math',
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(js|css|html)$/.test(name)) out.push(p)
  }
  return out
}

const blob = walk(dist).map((f) => readFileSync(f, 'utf8')).join('\n')
let failed = false
for (const s of forbidden) {
  const count = blob.split(s).length - 1
  console.log(`[demo-strings] "${s}": ${count}`)
  if (count > 0) failed = true
}
if (failed) {
  console.error('[demo-strings] FAIL — demo identity/branding found in production dist/')
  process.exit(1)
}
console.log('[demo-strings] OK')
