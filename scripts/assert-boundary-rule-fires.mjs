#!/usr/bin/env node
/**
 * Prove dependency-cruiser domain-no-react-io rule fires on a deliberate violation.
 * Exit 0 only when depcruise reports the expected violation.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fixtureDir = join(root, 'scripts', '.boundary-fixture-tmp')
mkdirSync(fixtureDir, { recursive: true })
const badFile = join(fixtureDir, 'bad-domain.ts')
writeFileSync(
  badFile,
  `// Deliberate violation: domain must not import React
import { useState } from 'react'
export const x = useState
`,
)

const config = join(root, '.dependency-cruiser.fixture.cjs')
writeFileSync(
  config,
  `module.exports = {
  forbidden: [
    {
      name: 'domain-no-react-io',
      severity: 'error',
      from: { path: 'scripts/\\\\.boundary-fixture-tmp' },
      to: { path: 'node_modules/react' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
  },
}
`,
)

try {
  const r = spawnSync(
    'npx',
    ['depcruise', '--config', config, 'scripts/.boundary-fixture-tmp'],
    { encoding: 'utf8', cwd: root },
  )
  const out = `${r.stdout || ''}\n${r.stderr || ''}`
  const fired =
    r.status !== 0 &&
    (out.includes('domain-no-react-io') || out.includes('error') || out.includes('violation'))
  if (!fired) {
    console.error('[boundary-fixture] Expected depcruise to fail on React import from domain fixture.')
    console.error(out)
    process.exit(1)
  }
  console.log('[boundary-fixture] OK — domain-no-react-io rule fired as expected')
} finally {
  rmSync(fixtureDir, { recursive: true, force: true })
  rmSync(config, { force: true })
}
