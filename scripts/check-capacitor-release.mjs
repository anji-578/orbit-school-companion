#!/usr/bin/env node
/**
 * Release gate: Capacitor must not ship with a live-reload server.url.
 * Prefer capacitor.config.release.ts contents when syncing release AABs.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const main = resolve(root, 'capacitor.config.ts')
const release = resolve(root, 'capacitor.config.release.ts')

function assertNoLiveReload(path, label) {
  if (!existsSync(path)) {
    console.error(`[cap:release:check] missing ${label}: ${path}`)
    process.exit(1)
  }
  const src = readFileSync(path, 'utf8')
  // Match url: 'http...' inside server block (ignore comments)
  const withoutComments = src
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n')
  if (/server\s*:\s*\{[^}]*\burl\s*:/.test(withoutComments)) {
    console.error(`[cap:release:check] FAIL: ${label} still sets server.url (live-reload).`)
    process.exit(1)
  }
  console.log(`[cap:release:check] OK: ${label} has no server.url`)
}

assertNoLiveReload(release, 'capacitor.config.release.ts')
assertNoLiveReload(main, 'capacitor.config.ts')
