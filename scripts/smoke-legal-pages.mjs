#!/usr/bin/env node
/**
 * Smoke legal pages on a deployed host (or local preview).
 * Usage: ORBIT_PROD_HOST=https://example.vercel.app npm run smoke:legal
 *        ORBIT_PROD_HOST=http://127.0.0.1:4173 npm run smoke:legal
 */
const host = (process.env.ORBIT_PROD_HOST || '').replace(/\/$/, '')
if (!host) {
  console.error('Set ORBIT_PROD_HOST to the site origin, e.g. https://your-app.vercel.app')
  process.exit(1)
}

const paths = ['/legal/privacy.html', '/legal/terms.html', '/legal/delete-account.html']
let failed = false

for (const p of paths) {
  const url = `${host}${p}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    const text = await res.text()
    const ok =
      res.ok &&
      text.includes('<h1') &&
      (p.includes('privacy')
        ? text.toLowerCase().includes('privacy')
        : p.includes('terms')
          ? text.toLowerCase().includes('terms')
          : text.toLowerCase().includes('delete'))
    if (!ok) {
      console.error(`[smoke:legal] FAIL ${url} status=${res.status}`)
      failed = true
    } else {
      console.log(`[smoke:legal] OK ${url}`)
    }
  } catch (e) {
    console.error(`[smoke:legal] FAIL ${url}:`, e instanceof Error ? e.message : e)
    failed = true
  }
}

if (failed) process.exit(1)
console.log('[smoke:legal] All legal pages OK')
