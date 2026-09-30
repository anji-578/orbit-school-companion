# Closure pass — Round 3 (2026-09-30)

Honest matrix. No UI redesign. Anything without pasted proof stays **NOT MET**.

## Commits

- `09237d1` Round 3 closure
- `64c6d6a` prior closure pass
- `6dc8882` phases 1–9 substrate

## 1. `npm run check` (pasted 2026-09-30)

```text
> orbit@0.0.0 check
> npm run typecheck && npm run lint && npm run format:check && npm run lint:boundaries && npm run check:boundary-fires && npm run test && vite build && npm run check:dist-secrets && npm run check:demo-strings && npm run check:cap-release

> typecheck — tsc -b && tsc -p tsconfig.api.json — pass
> lint — oxlint --max-warnings=28 — 28 warnings, exit 0 (at ratchet)
> format:check — All matched files use Prettier code style!
> lint:boundaries — ✔ no dependency violations found (193 modules, 806 dependencies cruised)
> check:boundary-fires — [boundary-fixture] OK — no-supabase-in-components fired
> test — Test Files  9 passed (9) / Tests  33 passed (33)
> vite build — ✓ built in 570ms
> check:dist-secrets — [dist-secrets] OK — no forbidden secret patterns in dist/
> check:demo-strings —
  [demo-strings] "Ananya Rao": 0
  [demo-strings] "Sunrise Demo Academy": 0
  [demo-strings] "Parent of Ananya": 0
  [demo-strings] OK
> check:cap-release — [cap-release] OK — release config has no server.url
EXIT:0
```

## 2. CI truth (`gh`)

```text
gh auth status → token in keyring is invalid (Forbidden on Actions API)
```

**NOT MET locally:** could not paste `gh run list/view` for `64c6d6a` / HEAD. Workflow updated for Round 3; status after push must be verified once `gh auth refresh` succeeds.

`sql-security` job now uses `supabase/postgres:15.8.1.060` (not vanilla Postgres). Local Docker unavailable on this workstation → SQL suite **NOT MET** as executed here; CI is the intended runner.

## 3. Exit criteria matrix (Round 3)

| # | Criterion | Status | Evidence |
|--|--|--|--|
| 1a | Latest CI green including sql-security | **NOT MET** | `gh` auth broken; no run output |
| 1b | supabase/postgres (real auth) in CI | **PARTIAL** | `.github/workflows/ci.yml` image set; not run here |
| 1c | Negative RLS controls + RLS-all assert | **PARTIAL** | `supabase/tests/03_isolation.sql`; needs CI green |
| 2a | `award_xp` no points arg; rules table | **MET** (migration) | `20260930125000_xp_rules_and_source_events.sql` |
| 2b | Verify source event + ownership + idempotency | **MET** (SQL file) | `supabase/tests/02_security_definer.sql` |
| 2c | No client I/U/D on ledger; grants dump | **PARTIAL** | asserted in SQL script; dump on CI run |
| 3a | Wire homework/quiz/scan/GK through award_xp | **MET** | `schoolOpsActions.ts`, `orbitStore.ts`, `StudyAssistant.tsx` |
| 3b | Hydrate XP totals; badges server-side | **MET** | `fetchXpProjection` on hydrate; no `unlockBadge` |
| 3c | XP unit tests | **MET** | `src/domain/xp/projection.test.ts` (33 tests total) |
| 4a | Fixtures behind build-time / `src/dev` | **PARTIAL** | `src/dev/fixtures/demo.ts` + dynamic load; empty `src/data/demo.ts` |
| 4b | Branding from `schools.is_demo` not email | **PARTIAL** | column + client email heuristics removed; hydrate does not yet set school name from `is_demo` row |
| 4c | Prod dist fails on demo strings | **MET** | pasted `check:demo-strings` zeros |
| 5a | Component→supabase canary | **MET** | `check:boundary-fires` OK |
| 5b | Real codebase passes error rule | **MET** | StudyAssistant/ScannerPanel → `@/services/ai/client` |
| 6a | Gitleaks blocking | **PARTIAL** | `continue-on-error` removed in workflow; not proven via `gh` |
| 6b | Lint `--max-warnings=28` | **MET** | package.json + check output |
| 6c | Sentry + PII scrub + maps upload | **PARTIAL** | `services/logger/sentry.ts`, vite plugin when secrets present; no DSN/token in this env |
| 6d | CSP headers | **MET** | `vercel.json` CSP + frame-ancestors + Referrer-Policy |
| 7 | Manual smoke matrix | **NOT MET** | See §7 |
| 8 | This document updated | **MET** | this file |

## 4. award_xp design (Round 3)

```text
learning_events (client insert, RLS own)
  → award_xp(p_learning_event_id, p_idempotency_key)
      → looks up xp_award_rules.points / badge_name
      → verifies created_by = auth.uid() and student.profile_id = auth.uid()
      → insert xp_events ON CONFLICT DO NOTHING
```

No `points` argument on RPC.

## 5. XP wiring

| Flow | Event type |
|--|--|
| Homework complete | `homework_complete_{easy,medium,hard}` + `homework_all_done` |
| Perfect quiz | `quiz_perfect` |
| Scan practice | `scan_practice_pass` + `scan_practice_scholar` |
| GK | `gk_pass_*` / `gk_attempt` |
| Ask Orbit helpful | `ask_orbit_helpful` |

## 6. Demo strings in production dist

```text
[demo-strings] "Ananya Rao": 0
[demo-strings] "Sunrise Demo Academy": 0
[demo-strings] "Parent of Ananya": 0
```

Landing HTTP probe (dev server already up): `curl` → `200`.

## 7. Manual smoke matrix

| Step | Result |
|--|--|
| Login | **NOT RUN** — no interactive session this pass |
| Home | **NOT RUN** |
| Learn / subject / homework | **NOT RUN** |
| Ask Orbit + proxy | **NOT RUN** |
| Grow interests | **NOT RUN** |
| Me / settings | **NOT RUN** |
| Offline homework then reconnect | **NOT RUN** |
| Android back sheet→pop→Home→exit | **NOT RUN** — no emulator/device |
| XP awarded once | **NOT RUN** interactively; unit + SQL files cover logic |

Automated substitute: `npm run check` exit 0 (above). Dev server returned HTTP 200 on `/`.

## 8. Deferred

| Item | Estimate |
|--|--|
| Re-auth `gh` and confirm CI sql-security green | 0.5h |
| Hydrate `schools.is_demo` → profile.school branding | 0.5d |
| Full Playwright smoke in CI | 2–3d |
| Sentry org secrets + verify map upload | 0.5d |
| Drop remaining static demo stubs once Query repos land | 1–2d |
