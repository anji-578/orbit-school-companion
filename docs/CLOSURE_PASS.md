# Closure pass — Phases 1–9 (2026-09-30)

Honest exit-criteria audit. No new product features; no UI redesign.

## 1. Gate output

Captured via `npm run check` (exit 0). Full log: agent run `/tmp/orbit-closure-check4.txt`.

```text
> orbit@0.0.0 check
> npm run typecheck && npm run lint && npm run format:check && npm run lint:boundaries && npm run check:boundary-fires && npm run test && vite build && npm run check:dist-secrets && npm run check:cap-release && npm run audit:demo-bundle

> typecheck — pass
> lint — pass (warnings only)
> format:check — All matched files use Prettier code style!
> lint:boundaries — no dependency violations found (188 modules, 791 dependencies cruised)
> check:boundary-fires — OK — domain-no-react-io rule fired as expected
> test — Test Files  9 passed (9) / Tests  31 passed (31)
> vite build — ✓ built
> check:dist-secrets — OK — no forbidden secret patterns in dist/
> check:cap-release — OK — release config has no server.url
> audit:demo-bundle — see §6
```

### `git log --oneline` (main)

```text
6dc8882 feat: land student Phases 1–9 architecture substrate
c5de751 docs: Phase 0 student architecture audit and target map.
ef70c6f Refine student Home to the quiet Orbit glance mock.
ac205de Redesign student Home to match the premium Orbit mock.
2565494 Ship student Phases 2–8: briefing Home through mobile polish.
9342514 Restructure student Learn/Me IA for Phase 1 depth.
```

(Closure commit hash appended after push.)

## 2. Exit criteria matrix

| Phase | Exit criterion (from prompt) | Status | Evidence |
|--|--|--|--|
| **1** | `npm run check` green locally | **MET** | §1 output exit 0 |
| **1** | CI: typecheck, lint, boundaries, unit tests, build | **MET** | `.github/workflows/ci.yml` `check` job |
| **1** | Typed env + `.env.example` public/secret split | **MET** | `src/shared/config/env.ts`, `.env.example` |
| **1** | Vitest harness | **MET** | `vitest.config.ts`, 31 tests |
| **1** | Playwright e2e in CI on PR | **NOT MET** | `e2e/smoke.spec.ts` exists; **not** wired in CI job |
| **1** | Gitleaks blocking | **PARTIAL** | CI step `continue-on-error: true` |
| **1** | `noUncheckedIndexedAccess` / exactOptional | **NOT MET** | `tsconfig.app.json` has `strict` + `noImplicitOverride` only |
| **2** | Target folders + `git mv` history-preserving moves | **PARTIAL** | Facades `src/features/{home,learn,grow,me}/index.ts`; screens still under `student-app/screens/` |
| **2** | Domain pure functions + characterization tests | **MET** | `src/domain/**` + `*.test.ts` |
| **2** | Files ≤300 lines / store slice split | **NOT MET** | `orbitStore.ts` still ~1.3k LOC |
| **2** | Error boundaries | **MET** | `src/app/providers/ErrorBoundary.tsx`, used in `App.tsx` / `StudentApp.tsx` |
| **2** | Boundary check passes | **MET** | depcruise OK + fixture fires (`scripts/assert-boundary-rule-fires.mjs`) |
| **3** | TanStack Query replaces mega-hydrate | **PARTIAL** | `QueryProvider` + `useHomeworkQuery` bridge; `hydrateFromSupabase` still boots |
| **3** | No server data in Zustand persist | **PARTIAL** | `partialize` prefs-only (no tasks/XP); hydrate still fills store |
| **3** | Sample data tree-shaken from prod | **NOT MET** | §6 grep: `Ananya Rao`, `demo50.orbit.app`, `Sunrise Demo Academy` still in `dist/` |
| **3** | `useNow` replaces student 900ms tickBus | **MET** | `StudentApp.tsx` uses `useNow`; AppShell skips tick for student |
| **3** | Generalized offline queue | **PARTIAL** | `services/offline/mutation-queue.ts` + tests; attendance still also uses legacy `attendanceQueue.ts` |
| **3** | No component imports Supabase | **NOT MET** | Many feature files still call `lib/*Api` / store hydrate |
| **4** | AI proxy-only; no client key | **MET** | `src/lib/gemini.ts` proxy-only; `check:dist-secrets` OK; vite warns if `VITE_GEMINI_*` set |
| **4** | Server XP ledger + client cannot raise XP | **MET** | Migrations + removed `addXp`; `src/domain/xp/projection.test.ts` |
| **4** | RLS matrix + automated tests | **PARTIAL** | `docs/RLS.md`; SQL tests in `supabase/tests/**`; CI `sql-security` job (local Docker unavailable on this machine) |
| **4** | SECURITY DEFINER hardened | **MET** | `20260930124000_secure_definer_hardening.sql` |
| **4** | Demo separation `isDemoAccount` | **PARTIAL** | `src/dev/isDemoAccount.ts` used; demo strings still bundle |
| **4** | CSP / web hardening | **NOT MET** | No CSP headers added this pass |
| **5** | Nav reducer + tests | **MET** | `src/app/nav/student-nav-reducer.ts` + tests |
| **5** | Android back + persist TTL | **MET** | `StudentNavContext.tsx` |
| **5** | Deep links | **MET** | `src/app/nav/deep-link.ts` + tests |
| **5** | FCM Capacitor push | **NOT MET** | web-push only |
| **5** | Release Capacitor no `server.url` | **MET** | `capacitor.config.release.ts` + `check:cap-release` |
| **5** | Lazy loading / bundle budget fail | **NOT MET** | Bundle still ~1.4MB; warning only |
| **6** | Logger / analytics / flags | **MET** | `src/services/{logger,analytics,feature-flags}` |
| **6** | Sentry staging proof | **NOT MET** | No Sentry package / DSN wiring |
| **7** | Consent tables + gate flag | **PARTIAL** | migrations + `ConsentGate` (flag default **off**) |
| **7** | Export/erasure RPCs + tests | **PARTIAL** | RPCs + SQL tests; not proven locally (no Postgres) |
| **7** | DATA_MAP / RETENTION | **MET** | `docs/DATA_MAP.md`, `docs/RETENTION.md` |
| **8** | Attempts/mastery schema + pure domain | **MET** | migration + `domain/mastery`, `domain/scheduling` |
| **8** | Instrument homework/quiz to write attempts | **NOT MET** | flag `recordAttempts` unused in flows |
| **9** | Coverage gates 90%/85% fail CI | **NOT MET** | coverage collected; no threshold fail |
| **9** | Playwright CI on PR | **NOT MET** | see Phase 1 |
| **9** | ADRs + RUNBOOK + README 10-min setup | **MET** | `docs/ADRs/*`, `RUNBOOK.md`, README scripts |
| **9** | Manual smoke checklist executed | **NOT MET** | No interactive device/browser smoke recorded this pass |

## 3. CI additions (this pass)

| Check | Script / job |
|--|--|
| Dist secret patterns | `scripts/assert-dist-no-secrets.mjs` |
| Depcruise rule fires | `scripts/assert-boundary-rule-fires.mjs` |
| Cap release no `server.url` | `scripts/assert-capacitor-release.mjs` |
| SQL SECURITY DEFINER + isolation | `sql-security` job + `scripts/run-sql-security-tests.sh` |

## 4. SECURITY DEFINER review

| Function | `search_path` | revoke public/anon | `auth.uid()` ownership | Idempotency |
|--|--|--|--|--|
| `award_xp` | fixed `public` | yes | student self or school same-school | `ON CONFLICT DO NOTHING` on `(student_id, idempotency_key)` |
| `export_student_data` | fixed | yes | self / parent / school | n/a |
| `anonymize_student` | fixed | yes | school same-school only | n/a |

Tests: `supabase/tests/02_security_definer.sql`, `03_isolation.sql`.

## 5. XP authority

- Removed client `addXp` / inventing paths (`orbitStore`, `schoolOpsActions`, `StudyAssistant`).
- Read projection via `setGamificationProjection` + `domain/xp/projection.ts`.
- Test: `src/domain/xp/projection.test.ts` asserts `addXp` undefined and additive client deltas rejected.

## 6. Demo / sample in production bundle

`npm run audit:demo-bundle` after production build:

```text
demo50.orbit.app: 2
DEMO50: 0
Sunrise Demo Academy: 3
withSample: 0
Ananya Rao: 10
initialTasks: 0
generate-demo50: 0
```

**Conclusion:** demo branding/strings and sample identity still ship in the client bundle. **NOT MET** for tree-shake requirement.

## 7. Deferred (owner-sized)

| Item | Estimate |
|--|--|
| Physical `git mv` feature folders + delete facades | 1–2 eng-days |
| Replace `hydrateFromSupabase` with Query repositories end-to-end | 3–5 eng-days |
| Tree-shake `src/data/demo` / demo50 out of prod builds | 1–2 eng-days |
| Wire `award_xp` on homework/quiz/scan + hydrate XP totals | 1 eng-day |
| Instrument attempts behind `recordAttempts` | 1–2 eng-days |
| Playwright suite in CI + local Supabase service | 2–3 eng-days |
| FCM Capacitor push + token revoke | 2–3 eng-days |
| Sentry + CSP headers | 1 eng-day |
| Coverage thresholds failing CI | 0.5 eng-day |
| Split `orbitStore` into slices / ≤300 LOC files | 2–4 eng-days |
| Consent gate UX (design phase) | design + 1 eng-day |
| Manual smoke matrix on Android emulator | 0.5 eng-day |

## Smoke

Interactive smoke **not executed** this pass (no UI session). Gates above are automated only.
