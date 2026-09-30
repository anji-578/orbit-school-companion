#!/usr/bin/env node
/**
 * Report whether demo50 / sample seed markers appear in production dist/.
 * Exit 0 always (evidence collector); prints counts for the closure report.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')
const needles = [
  'demo50.orbit.app',
  'DEMO50',
  'Sunrise Demo Academy',
  'withSample',
  'Ananya Rao',
  'initialTasks',
  'generate-demo50',
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
console.log('[demo-bundle-audit]')
for (const n of needles) {
  const count = blob.split(n).length - 1
  console.log(`  ${n}: ${count}`)
}
