#!/usr/bin/env node
/**
 * Fail if release Capacitor config contains live-reload server.url.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const release = resolve(process.cwd(), 'capacitor.config.release.ts')
if (!existsSync(release)) {
  console.error('[cap-release] missing capacitor.config.release.ts')
  process.exit(1)
}
const src = readFileSync(release, 'utf8')
  .split('\n')
  .filter((l) => !l.trim().startsWith('//'))
  .join('\n')
if (/server\s*:\s*\{[^}]*\burl\s*:/.test(src)) {
  console.error('[cap-release] FAIL: capacitor.config.release.ts sets server.url')
  process.exit(1)
}
console.log('[cap-release] OK — release config has no server.url')
