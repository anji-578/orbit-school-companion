/**
 * Student QA: latency + critical-path smoke against local Vite.
 * Run: node scripts/qa-student-perf.mjs
 * Requires Playwright browsers + Vite on 127.0.0.1:5173
 */
import { chromium, devices } from '@playwright/test'
import { writeFileSync } from 'node:fs'

const BASE = process.env.ORBIT_QA_BASE || 'http://127.0.0.1:5173'
const out = {
  base: BASE,
  startedAt: new Date().toISOString(),
  pages: [],
  flows: [],
  a11y: [],
  consoleErrors: [],
  summary: {},
}

function pct(sorted, p) {
  if (!sorted.length) return null
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return Math.round(sorted[i])
}

async function measureGoto(page, path, label) {
  const errors = []
  const onErr = (msg) => {
    if (msg.type() === 'error') errors.push(msg.text().slice(0, 240))
  }
  page.on('console', onErr)
  const start = Date.now()
  const res = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  const dcl = Date.now() - start
  await page.waitForTimeout(400)
  const ready = Date.now() - start
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const paints = performance.getEntriesByType('paint')
    const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime
    return {
      ttfb: nav ? Math.round(nav.responseStart) : null,
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      fcp: fcp != null ? Math.round(fcp) : null,
      transferSize: nav ? nav.transferSize : null,
    }
  })
  page.off('console', onErr)
  const row = {
    label,
    path,
    status: res?.status() ?? null,
    wallDclMs: dcl,
    wallReadyMs: ready,
    ...perf,
    consoleErrors: errors,
  }
  out.pages.push(row)
  out.consoleErrors.push(...errors.map((e) => ({ path, error: e })))
  return row
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()

  // Landing cold + warm
  await measureGoto(page, '/', 'Landing cold')
  await measureGoto(page, '/', 'Landing warm')

  // Dev student preview with fixtures (filled demo)
  await measureGoto(page, '/dev/student?theme=dark&fixtures=1&dest=home', 'Student Home (fixtures)')
  const homeVisible = await page.getByTestId('student-preview').isVisible().catch(() => false)
  out.flows.push({ name: 'Student preview mounts', pass: homeVisible })

  // Tab navigation latency
  for (const [tab, dest, expectText] of [
    ['Learn', 'learn', /Study tools|Learn/i],
    ['Grow', 'grow', /Grow|Discover|Explore/i],
    ['Me', 'me', /Me|Settings|Profile/i],
  ]) {
    const t0 = Date.now()
    await page.goto(`${BASE}/dev/student?theme=dark&fixtures=1&dest=${dest}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    await page.getByTestId('student-preview').waitFor({ timeout: 20_000 })
    const ok = await page.getByText(expectText).first().isVisible().catch(() => false)
    out.flows.push({
      name: `Tab ${tab}`,
      pass: ok,
      ms: Date.now() - t0,
    })
  }

  // Study tools visible at top of Learn
  await page.goto(`${BASE}/dev/student?theme=dark&fixtures=1&dest=learn`, {
    waitUntil: 'domcontentloaded',
  })
  await page.getByTestId('student-preview').waitFor({ timeout: 20_000 })
  const studyTools = page.getByText('Study tools').first()
  const askOrbit = page.getByRole('button', { name: /Ask Orbit/i }).first()
  const toolsVisible = await studyTools.isVisible().catch(() => false)
  const askVisible = await askOrbit.isVisible().catch(() => false)
  // Study tools should appear before subjects scroll depth — check y position
  const orderOk = await page.evaluate(() => {
    const tools = [...document.querySelectorAll('*')].find((el) => el.textContent?.trim() === 'Study tools')
    const subjects = [...document.querySelectorAll('*')].find((el) =>
      /Your subjects/i.test(el.textContent || ''),
    )
    if (!tools || !subjects) return false
    return tools.getBoundingClientRect().top <= subjects.getBoundingClientRect().top
  })
  out.flows.push({ name: 'Study tools visible', pass: toolsVisible && askVisible })
  out.flows.push({ name: 'Study tools above subjects', pass: orderOk })

  // Settings + logout confirm
  await page.goto(`${BASE}/dev/student?theme=dark&fixtures=1&dest=settings`, {
    waitUntil: 'domcontentloaded',
  })
  await page.getByTestId('student-preview').waitFor({ timeout: 20_000 })
  const logout = page.getByRole('button', { name: 'Log out' })
  const logoutVisible = await logout.isVisible().catch(() => false)
  if (logoutVisible) {
    await logout.click()
    const dialog = await page.getByRole('dialog', { name: 'Log out?' }).isVisible().catch(() => false)
    out.flows.push({ name: 'Logout confirm dialog', pass: dialog })
    if (dialog) await page.getByRole('button', { name: 'Cancel' }).click()
  } else {
    out.flows.push({ name: 'Logout confirm dialog', pass: false })
  }

  // Empty honesty: fixtures=0 learn should not invent Mathematics
  await page.goto(`${BASE}/dev/student?theme=dark&fixtures=0&dest=learn`, {
    waitUntil: 'domcontentloaded',
  })
  await page.getByTestId('student-preview').waitFor({ timeout: 20_000 })
  const noSubjects = await page.getByText('No subjects yet').isVisible().catch(() => false)
  const fakeMath = await page.getByText('Mathematics').count()
  out.flows.push({ name: 'Empty Learn honesty (no fake subjects)', pass: noSubjects && fakeMath === 0 })

  // Gemini proxy latency (local open)
  const geminiTimes = []
  for (let i = 0; i < 3; i++) {
    const t0 = Date.now()
    const res = await page.request.post(`${BASE}/api/gemini`, {
      data: { prompt: 'Say hi in three words', jsonMode: false },
      timeout: 30_000,
    })
    geminiTimes.push({ status: res.status(), ms: Date.now() - t0, ok: res.ok() })
  }
  out.flows.push({
    name: 'Gemini /api/gemini',
    pass: geminiTimes.every((g) => g.ok),
    samples: geminiTimes,
  })

  // Aggregate page metrics
  const ready = out.pages.map((p) => p.wallReadyMs).filter((n) => typeof n === 'number').sort((a, b) => a - b)
  const fcp = out.pages.map((p) => p.fcp).filter((n) => typeof n === 'number').sort((a, b) => a - b)
  out.summary = {
    pagesMeasured: out.pages.length,
    flowsPass: out.flows.filter((f) => f.pass).length,
    flowsFail: out.flows.filter((f) => !f.pass).length,
    wallReadyP50Ms: pct(ready, 50),
    wallReadyP95Ms: pct(ready, 95),
    fcpP50Ms: pct(fcp, 50),
    consoleErrorCount: out.consoleErrors.length,
    geminiP50Ms: pct(
      geminiTimes.map((g) => g.ms).sort((a, b) => a - b),
      50,
    ),
  }
  out.finishedAt = new Date().toISOString()

  writeFileSync('test-results/qa-student-perf.json', JSON.stringify(out, null, 2))
  console.log(JSON.stringify(out.summary, null, 2))
  console.log('Wrote test-results/qa-student-perf.json')
  await browser.close()
  if (out.summary.flowsFail > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
