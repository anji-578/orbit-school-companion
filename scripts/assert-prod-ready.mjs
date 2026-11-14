#!/usr/bin/env node
/**
 * Pre-flight for Play / 1000-student pilot.
 * Fails on missing legal pages, Android release regressions, or unsafe prod env hints.
 */
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
let failed = false

function fail(msg) {
  console.error(`[prod-ready] FAIL: ${msg}`)
  failed = true
}

function ok(msg) {
  console.log(`[prod-ready] OK: ${msg}`)
}

for (const rel of [
  'public/legal/privacy.html',
  'public/legal/terms.html',
  'public/legal/delete-account.html',
  'docs/PLAY_STORE.md',
  'docs/PLAY_UPLOAD_DAY.md',
  'android/key.properties.example',
]) {
  if (!existsSync(resolve(root, rel))) fail(`missing ${rel}`)
  else ok(rel)
}

const cap = spawnSync('node', [resolve(root, 'scripts/assert-capacitor-release.mjs')], {
  encoding: 'utf8',
})
process.stdout.write(cap.stdout || '')
process.stderr.write(cap.stderr || '')
if (cap.status !== 0) fail('capacitor release check')

const android = spawnSync('node', [resolve(root, 'scripts/assert-android-release.mjs')], {
  encoding: 'utf8',
})
process.stdout.write(android.stdout || '')
process.stderr.write(android.stderr || '')
if (android.status !== 0) fail('android release check')

const keyProps = resolve(root, 'android/key.properties')
const keyJks = resolve(root, 'android/upload-keystore.jks')
if (existsSync(keyProps) && existsSync(keyJks)) ok('local upload keystore present (gitignored)')
else console.warn('[prod-ready] WARN: run npm run android:keystore before building AAB')

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
if (!pkg.version || pkg.version === '0.0.0') fail('package.json version must be 1.x for store')
else ok(`package version ${pkg.version}`)

// Soft checks against process env when ORBIT_ASSERT_PROD_ENV=1 (CI/prod machine)
if (process.env.ORBIT_ASSERT_PROD_ENV === '1') {
  for (const bad of ['ORBIT_DEV_AI_OPEN', 'ORBIT_ALLOW_DEMO_ENSURE', 'VITE_ENABLE_DEMO_FIXTURES']) {
    const v = process.env[bad]
    if (v === '1' || v === 'true') fail(`${bad} must not be set in production`)
  }
  if (!process.env.VITE_SENTRY_DSN?.trim()) {
    fail('VITE_SENTRY_DSN required when ORBIT_ASSERT_PROD_ENV=1')
  } else ok('VITE_SENTRY_DSN set')
  if (!process.env.GEMINI_API_KEY?.trim()) fail('GEMINI_API_KEY required when ORBIT_ASSERT_PROD_ENV=1')
  else ok('GEMINI_API_KEY set')
}

if (failed) process.exit(1)
console.log('[prod-ready] All local preflight checks passed')
