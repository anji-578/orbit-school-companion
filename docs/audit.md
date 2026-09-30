# Orbit Student — Phase 0 Audit

**Date:** 2026-09-30  
**Scope:** Repository baseline with emphasis on the **student shell** (`StudentApp` when `role === 'student'`).  
**Constraint:** Documentation only — no source behaviour changes in this phase.  
**Auditor role:** Principal engineer takeover (structure / security / testability).

---

## 1. Executive summary

The student product shell (4-tab Home · Learn · Grow · Me + in-memory nav + Ask Orbit sheet) is functionally rich and typechecks in isolation via `tsc --noEmit`, but is **not production-ready** as an engineered system:

- **`orbitStore` (~1.4k LOC)** is a god-object: persist, hydration, XP, AI, school ops, and UI toast live together.
- **Server-derived data is persisted** in Zustand (`partialize` includes tasks, attendance, curriculum, grades, notifications, competitions, XP…).
- **Client may hold `VITE_GEMINI_API_KEY`**; production build artifact heuristics found key-shaped material and JWT-like strings in `dist/`.
- **XP / badges are client-authoritative** (`addXp`, `unlockBadge`, homework toggle XP in `schoolOpsActions`).
- **No unit/e2e tests**, **no GitHub Actions CI**, **no `npm run check`**.
- **`npm run build` currently fails** (baseline) on an unused import in `SchoolRecordsScreen.tsx`.
- Android config commits **live-reload `server.url`**; no Capacitor back-button / process-death / FCM deep-link handling in app code.
- Offline queue exists **only for attendance**.

Risk-ranked remediation order is in §8. Target structure is in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 2. Repo map

```
orbit/
  src/
    App.tsx, AppShell.tsx, main.tsx, index.css
    auth/           AuthGate, authStore, supabaseAuth, demo users
    features/
      student-app/  ★ Student product shell (tabs, nav, hubs, Ask Orbit)
      student/      Legacy/desktop panels embedded as Level 2/3
      parent|teacher|school|shared|auth/
    store/          orbitStore (+ attendance/payment/schoolOps action factories)
    lib/            *Api.ts, gemini, paperCoach, supabase, sampleData, alerts…
    components/     layout (Sidebar/Header — non-student), ui primitives
    data/demo.ts    Large seed fixtures
    i18n/           en/te message catalogs
    types/
  api/              Vercel serverless: gemini, notify, ensure-demo, razorpay
  supabase/         SQL scripts (not fully timestamped migrations/), seeds, demo50
  android/          Capacitor Android project
  capacitor.config.ts
  docs/             Product/cost docs + this audit
  scripts/          demo50/pilot100 provisioning
```

**Student entry:** `AuthGate` → `AppShell` → if student → `StudentApp` (`src/features/student-app/`).

### Dependency graph summary (madge via `npx`, not permanently installed)

Command (student-app subgraph):

```bash
npx madge@8.0.0 --extensions ts,tsx --ts-config tsconfig.app.json --json src/features/student-app
```

| Metric | Result |
|--|--|
| Nodes in subgraph | ~87 modules |
| Edges into `orbitStore` | **35** |
| Edges into supabase helpers | **27** |
| Edges into `gemini` | **3** (StudyAssistant, ScannerPanel, paperCoach path) |
| Circular deps (broader) | **1** confirmed: `lib/attendanceApi.ts` ↔ `lib/linkedStudent.ts` |

Interpretation: the student shell funnels almost all data/behaviour through `orbitStore`. Feature UI already imports Gemini/store/API helpers directly — violating the intended `components → hooks → repositories → services` rule.

---

## 3. Size / quality hotspots

### 3.1 Files over 300 lines (`src/**/*.ts(x)`)

| Lines | File |
|--|--|
| 1581 | `src/i18n/messages.ts` |
| 1396 | `src/store/orbitStore.ts` |
| 1034 | `src/data/demo.ts` |
| 735 | `src/features/student/StudentDashboard.tsx` (legacy; not used by `StudentApp`) |
| 682 | `src/features/student/AcademicProfile.tsx` |
| 517 | `src/components/layout/Sidebar.tsx` |
| 443 | `src/features/shared/ScannerPanel.tsx` |
| 430 | `src/features/student/GkQuizPanel.tsx` |
| 419 | `src/features/school/SchoolDashboard.tsx` |
| 416 | `src/lib/gemini.ts` |
| 407 | `src/types/index.ts` |
| 395 | `src/features/school/SchoolFees.tsx` |
| 394 | `src/features/auth/LandingPage.tsx` |
| 382 | `src/lib/schoolOpsApi.ts` |
| 379 | `src/features/auth/LoginPage.tsx` |
| 353 | `src/features/teacher/TeacherProfilePanel.tsx` |
| 347 | `src/features/school/SchoolRoster.tsx` |
| 338 | `src/features/parent/PaymentsPanel.tsx` |
| 336 | `src/features/student/StudyAssistant.tsx` |
| 316 | `src/auth/supabaseAuth.ts` |
| 315 | `src/features/student/CompetitionsPanel.tsx` |

Student-app shell files are mostly under 300 (largest: `HomeToday.tsx` ~254).

### 3.2 Functions over 60 lines (heuristic scan)

~**72** functions/components over 60 lines. Student-relevant examples:

| Lines | Symbol | File |
|--|--|
| 659 | `AcademicProfile` | `features/student/AcademicProfile.tsx` |
| 575 | `StudentDashboard` | `features/student/StudentDashboard.tsx` |
| 397 | `ScannerPanel` | `features/shared/ScannerPanel.tsx` |
| 381 | `GkQuizPanel` | `features/student/GkQuizPanel.tsx` |
| 324 | `StudyAssistant` | `features/student/StudyAssistant.tsx` |
| 201 | `HomeToday` | `features/student-app/screens/HomeToday.tsx` |
| 184 | `LearnHub` | `features/student-app/screens/LearnHub.tsx` |

### 3.3 `any` / `@ts-ignore` / eslint-disable / TODO

| Pattern | Count / notes |
|--|--|
| Explicit `any` in store factories | **3** — `createPaymentActions(set: any, get: any)`, `createAttendanceActions`, `createSchoolOpsActions` |
| `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` in `src` | **0** |
| `eslint-disable` in `src` | **0** |
| `TODO`/`FIXME` in `src` | No real TODOs found (false positive in AlertsPanel placeholder string) |
| `console.log` in `src` | **0** |

### 3.4 TypeScript config baseline

`tsconfig.app.json`: `"strict": true` already. **Missing** (Phase 1 targets): `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, path aliases (`@/app`, …).

---

## 4. IO inventory

### 4.1 Supabase

Client: `src/lib/supabase.ts` + `supabaseConfig.ts` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

**~25 files** call `getSupabase()`. Notable student-path modules:

- `src/store/orbitStore.ts` — mega hydrate
- `src/lib/schoolOpsApi.ts`, `attendanceApi.ts`, `gradesApi.ts`, `syllabusApi.ts`, `timetableApi.ts`, `staffApi.ts`, `notificationsApi.ts`, `classLink.ts`, `alerts.ts`, …
- `src/auth/supabaseAuth.ts`, `authStore.ts`

Admin/service-role usage is confined to **server** `api/_lib/supabaseAdmin.ts` and provisioning scripts (not client).

### 4.2 Gemini / AI

| Location | Role |
|--|--|
| `src/lib/gemini.ts` | Client tutor/quiz/vision; reads **`VITE_GEMINI_API_KEY`**; also tries `/api/gemini` |
| `api/gemini.ts` | Server proxy; accepts `GEMINI_API_KEY` or falls back to `VITE_GEMINI_API_KEY` |
| `src/lib/paperCoach.ts` | Vision coach via gemini |
| `StudyAssistant.tsx`, `ScannerPanel.tsx` | UI callers |

**Confirmed risk:** client bundle can embed the Gemini key whenever `VITE_GEMINI_API_KEY` is set at build time. Dist heuristic scan found **`AQ.`-shaped material** and **`GEMINI` string** inside `dist/assets/*.js`.

### 4.3 `fetch(`

Client: `/api/gemini`, `/api/notify`, `/api/ensure-demo`, `/api/razorpay/*`.  
Server: Gemini HTTP, Razorpay, MSG91.

### 4.4 Persist / `localStorage`

| Mechanism | What |
|--|--|
| `zustand/persist` `orbit-school-v1` | **Large** partialize — includes server-ish entities (see §6.2) |
| `authStore` persist | Session/UI auth |
| `localAccounts.ts` | Local demo accounts |
| `schoolPolicy.ts` | Policy + teacher class |
| `attendanceQueue.ts` | Offline attendance mutations |
| `confidentialDocs.ts` | Doc metadata |
| `linkedStudent.ts` | Active child id |

### 4.5 Timers

| Timer | Where | Notes |
|--|--|
| **`setInterval(tickBus, 900)`** | `StudentApp.tsx`, also `AppShell.tsx` (non-student) | Bus animation / “now” ticks — **battery + re-render risk** |
| `setInterval(..., 1400/1600)` | Transport/Fleet panels | Parent/school |
| `setInterval(run, 30_000)` | `attendanceQueue.ts` | Offline flush |
| Various `setTimeout` | Toast clear, speech estimate, scan flash, gemini retry delay | |

---

## 5. Environment variables

### Client (`import.meta.env` / `VITE_*`) — reach the browser bundle

| Variable | Used for |
|--|--|
| `VITE_SUPABASE_URL` | Supabase client |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon JWT (**expected** in client; must stay anon-scoped) |
| `VITE_GEMINI_API_KEY` | **Secret-capable — should NOT be client** |
| `VITE_VAPID_PUBLIC_KEY` | Web Push (public by design) |
| `VITE_RAZORPAY_KEY_ID` | Payments (public key id) |
| `VITE_DEFAULT_SCHOOL_CODE` / `VITE_DEFAULT_CLASS_NAME` | Defaults |

### Server-only (intended)

`GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `VAPID_PRIVATE_KEY`, `MSG91_*`, notify secrets.

### Dist scan (names only; values not printed)

After `vite build` (when it succeeds on a clean tree) / residual `dist/`:

| Pattern | Present in dist? |
|--|--|
| JWT-like (`eyJ…`) | **Yes** (anon key expected if baked at build) |
| `AQ.`-style key material | **Yes** — strongly indicates Gemini key leakage via `VITE_` |
| `*.supabase.co` URL | Yes |
| `service_role` string | No |
| `sk_live` / `sk_test` | No |

---

## 6. Secrets scan (no values printed)

### Working tree

| Finding | Severity | Notes |
|--|--|
| Local **`.env`** present with Gemini, Supabase anon, **service role**, VAPID private, AQ-style key | **Critical (local)** | File is **gitignored** and **not tracked**. Still a workstation risk; must never be committed. |
| `.env.example` | OK | Placeholder names only (tracked). |
| `api/_lib/supabaseAdmin.ts` | OK | Reads env; no hardcoded secret. |
| Large `supabase/.demo50_*` / `.mcp_batch` SQL | Medium hygiene | Seed/auth SQL noise; keep out of prod artifacts. |

### Git history

- `.env` **not** found in git history via `git log -- .env`.
- Commits mentioning API keys/Gemini exist historically as **feature work**, not necessarily as committed secrets — treat with continued `gitleaks` in Phase 1 CI.

**Action required before Phase 4:** rotate any key that was ever present in a developer `.env` used for production-bound builds (especially if `VITE_GEMINI_*` was set during a Vercel/client build).

---

## 7. Quality gates baseline (Phase 0 measured)

| Gate | Result | Notes |
|--|--|--|
| `npx tsc --noEmit` | **Pass** (exit 0) | Root/`tsc` behaviour can differ from project build |
| `npm run lint` (`oxlint`) | **Pass with warnings** (exit 0) | ~28 warnings (hooks deps, unused `SaCard`, fast-refresh exports) |
| `npm run build` | **FAIL** (exit 2) | `SchoolRecordsScreen.tsx`: unused `SaCard` (`TS6133`) via `tsc -b` |
| Unit tests | **None** | No Vitest/Jest configs; no `*.test.ts(x)` in app source |
| E2E | **None** | No Playwright |
| CI | **None** | No `.github/workflows` |
| Coverage | **None** | |

**Baseline debt for Phase 1:** fix unused import so `build` is green; then introduce `check` script + CI.

---

## 8. Known problems — confirmation matrix

| # | Problem | Status | Evidence |
|--|--|--|--|
| 1 | `orbitStore` god-object | **Confirmed** | `src/store/orbitStore.ts` ~1396 LOC; hydrate + XP + AI + persist + toast |
| 2 | Server data persisted → pollution | **Confirmed** | `partialize` includes `tasks`, `attendanceRecords`, `curriculum`, `studentGrades`, `notifications`, `competitions`, `totalXp`, …; migrate already clears Ananya demo identity |
| 3 | One boot hydrate; no cache/retry/per-resource states | **Confirmed** | `hydrateFromSupabase` parallel blob; no TanStack Query; screens lack loading/error machines |
| 4 | Gemini callable from client / key exposure | **Confirmed** | `getApiKey()` reads `VITE_GEMINI_API_KEY`; dist shows key-shaped bytes; UI imports `gemini.ts` directly |
| 5 | XP/badges/streak client-authoritative | **Confirmed** | `addXp`/`unlockBadge` in store; homework XP in `schoolOpsActions`; `presentStreak` duplicated in Home/Me/StudentDashboard |
| 6 | Sample/seed mixed into prod paths | **Partially** | `withSample` correctly refuses inventing when Supabase configured; but `src/data/demo.ts` + competitions/GK seed still ship in client bundle; no `src/dev` tree-shake boundary |
| 7 | Android back / process-death / push deep links | **Confirmed (missing)** | No `App.addListener('backButton')`, no nav persist/restore, no FCM/`PushNotifications` usage in `src` |
| 8 | web-push unreliable in Android WebView | **Confirmed (architecture)** | `src/lib/alerts.ts` uses VAPID web-push only; Capacitor push not integrated |
| 9 | Offline queue attendance-only | **Confirmed** | `src/lib/attendanceQueue.ts`; homework completion sync is online-oriented |
| 10 | Only oxlint; no CI/tests/type gate | **Confirmed** | No workflows; build not gated; no tests |
| 11 | Demo50 mixed with production auth/branding | **Confirmed** | Email suffix checks in `MeHub` / `AcademicProfile`; `/api/ensure-demo`; shared login paths |
| 12 | 900 ms `tickBus` drain | **Confirmed** | `StudentApp.tsx` `setInterval(..., 900)` |
| 13 | Business logic in components/stores | **Confirmed** | streak/priority/continue/dueUrgency embedded in hubs; XP rules in store actions |
| 14 | Homework boolean; no attempt-level model | **Confirmed** | `HomeworkTask.completed: boolean`; no attempts/mastery tables wired |
| 15 | Privacy/compliance foundations missing | **Confirmed** | No consent tables/gate; school CSV export exists (`dataExport`) but not student DSAR erasure/consent purpose model |

---

## 9. Risk-ranked fix order (recommended)

1. **Secret / AI key hygiene** — stop shipping `VITE_GEMINI_*`; force proxy-only; rotate exposed keys. (Security)
2. **Make `npm run build` + CI green** — unused import, `check` script, gitleaks, typecheck. (Phase 1)
3. **Stop persisting server entities** — shrink Zustand partialize; characterization tests first. (Phase 2–3)
4. **Extract domain pure functions** (streak, priority, continue) + tests. (Phase 2)
5. **TanStack Query repositories** replace mega-hydrate. (Phase 3)
6. **Server-authoritative XP ledger** + RLS tests. (Phase 4)
7. **Nav reducer + Android back + kill live-reload in release**. (Phase 5)
8. **Observability / consent / mastery schemas** after core hardening. (Phases 6–8)

---

## 10. Student feature surface (unchanged behaviour inventory)

Documented for regression smoke in later phases (UI must stay identical):

- Home glance: Next, Priority, Today, streak
- Learn: Continue · Subjects · Upcoming → Subject home → filtered homework/topics; Ask Orbit sheet; Scan
- Grow: interests ≤4, For You, Explore
- Me: identity, portfolio, school records, settings
- Global: notifications bell, theme/lang/logout paths as currently wired

Legacy `StudentDashboard.tsx` appears unused by `StudentApp` — **candidate dead code** (confirm in Phase 2 before delete).

---

## 11. Assumptions

- Phase 0 “student shell only” still requires repo-wide audits where god-store / secrets / CI affect students.
- Dist scan used whatever `dist/` existed after build attempts; key leakage conclusion is reinforced by source (`VITE_GEMINI_API_KEY`) regardless.
- `withSample` empty-cloud behaviour is intentional honesty, not a bug — still not a substitute for a `src/dev` boundary.
- Capacitor live-reload URL in committed `capacitor.config.ts` is treated as **release risk**, not merely local convenience.

---

## 12. Deferred (out of Phase 0)

- Fixing the unused `SaCard` import (belongs in Phase 1 tooling green-up; **no behaviour change**).
- Installing permanent madge/dependency-cruiser/Vitest (Phase 1).
- Any folder moves or store splits (Phase 2+).

---

*End of Phase 0 audit. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for current vs target mapping.*
