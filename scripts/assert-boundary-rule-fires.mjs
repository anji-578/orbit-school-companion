#!/usr/bin/env node
/**
 * Prove dependency-cruiser fails when a component imports services/supabase.
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const fixtureDir = join(root, 'scripts', '.boundary-fixture-tmp')
mkdirSync(join(fixtureDir, 'features', 'home', 'components'), { recursive: true })
writeFileSync(
  join(fixtureDir, 'features', 'home', 'components', 'Bad.tsx'),
  `import { getSupabase } from '@/services/supabase/client'\nexport function Bad() { return getSupabase() }\n`,
)
const config = join(root, '.dependency-cruiser.fixture.cjs')
writeFileSync(
  config,
  `module.exports = {
  forbidden: [{
    name: 'no-supabase-in-components',
    severity: 'error',
    from: { path: 'scripts/\\\\.boundary-fixture-tmp/features/.+/components' },
    to: { path: 'services/supabase|lib/supabase' },
  }],
  options: { doNotFollow: { path: 'node_modules' } },
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
  if (r.status === 0) {
    console.error('[boundary-fixture] Expected failure for services/supabase import from component')
    console.error(out)
    process.exit(1)
  }
  console.log('[boundary-fixture] OK — no-supabase-in-components fired')
} finally {
  rmSync(fixtureDir, { recursive: true, force: true })
  rmSync(config, { force: true })
}
