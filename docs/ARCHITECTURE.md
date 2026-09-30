# Orbit Student — Architecture

**Companion to:** [`audit.md`](./audit.md) (Phase 0)  
**Scope:** Student experience and the shared substrate it depends on (`orbitStore`, auth, Gemini, Supabase).  
**UI rule:** Later structural refactors must preserve rendered output until an explicit design phase.

---

## 1. Current state

### 1.1 Runtime composition

```
main.tsx
  ThemeSync (document data-theme from orbitStore)
  AuthGate (authStore.bootstrap)
    → LandingPage | LoginPage | AppShell
AppShell
  if role/session is student → StudentApp
  else → desktop Sidebar + Header + MainContent
```

**StudentApp** (`src/features/student-app/StudentApp.tsx`):

1. Forces `role = 'student'`
2. Calls `hydrateFromSupabase()` once on mount
3. Starts **`setInterval(tickBus, 900)`**
4. Renders: `StudentTopBar` → scroll `StudentScreen` → optional `StudentBottomNav` → `AskOrbitSheet` → `ToastHost`

### 1.2 Navigation (current)

In-memory only — **no URL router**.

| Piece | Location |
|--|--|
| Destinations / tab map | `studentNav.ts` |
| Provider API | `StudentNavContext.tsx` — `setTab`, `push`, `pop`, `openAskOrbit`, `closeAskOrbit` |
| Params | `subject`, `taskId`, `section` |
| Deep focus | `stack.length >= 3` hides bottom nav |
| Ask Orbit | Overlay sheet; seeds `aiPrompt`; does not push stack |

Public behaviour that must be preserved in Phase 5 reducer extraction: push dedupe, tab switch resets stack root, Ask Orbit closes on tab change.

### 1.3 State (current)

| Store | Responsibility today |
|--|--|
| `authStore` | Session, login/logout, password reset; persisted |
| `orbitStore` | **Everything else** — prefs, hydrated school data, XP/badges, AI panel fields, scan wizard, toast, tickBus, hydrate |

**Persist key:** `orbit-school-v1` with a migrate that clears stale “Ananya Rao” demo identity.  
**Problem:** `partialize` saves server-derived collections (tasks, attendance, curriculum, grades, notifications, competitions, fees…) → stale cloud / demo bleed.

### 1.4 Data flow (current)

```
UI components
  → useOrbitStore selectors / actions
    → lib/*Api.ts (Supabase)
    → lib/gemini.ts (proxy OR direct key)
    → withSample(remote, demo) on hydrate
```

There is **no** repository layer, **no** Zod boundary validation, **no** TanStack Query cache, **no** per-resource loading/error state.

### 1.5 AI (current)

```
StudyAssistant / ScannerPanel / paperCoach
  → gemini.ts
       → prefer POST /api/gemini (JWT optional via authHeaders)
       → fallback: browser fetch to Google with VITE_GEMINI_API_KEY
```

Offline tutor / fallback quiz paths exist when AI fails.

### 1.6 Gamification (current)

- `totalXp`, `unlockedBadges` live in client store and are **persisted**.
- Homework toggle adjusts XP locally then syncs `homework_completions`.
- Streak is a pure trailing-Present fold in UI components (duplicated).
- No append-only `xp_events` ledger; client can invent XP via store actions.

### 1.7 Platform (current)

- Capacitor Android `app.orbit.student`, `webDir: dist`
- Committed `capacitor.config.ts` includes **live-reload** `server.url: http://10.0.2.2:5173`
- Push = web-push + VAPID (browser); not FCM Capacitor
- No hardware back-button handler; nav not restored after process death

### 1.8 Quality (current)

- oxlint locally; TypeScript `strict: true`
- No CI, no Vitest/Playwright, no dependency-cruiser boundaries
- `npm run build` **failing** at Phase 0 baseline (unused import)

---

## 2. Target state

Aligned with the principal-engineer prompt. Student-facing **behaviour and look stay the same**; structure and authority move.

### 2.1 Target tree

```
src/
  app/
    providers/     Auth, Theme, Query, Nav, Toast, ErrorBoundary
    shell/         StudentApp, TopBar, BottomNav, AskOrbitSheet host
    nav/           pure reducer, destinations, deep-link resolver
  features/
    home/ learn/ grow/ me/ ask-orbit/ scan/ notifications/ settings/
      components/ hooks/ api/ model/ index.ts
  domain/          streak, xp, priority, continue, mastery, scheduling (pure)
  services/        supabase/, ai/ (proxy only), push/, storage/, analytics/, logger/, offline/
  shared/          ui/, lib/, config/, i18n/, types/
  dev/             fixtures, demo mode (tree-shaken from prod)

supabase/migrations/ functions/ seed.sql tests/
docs/ ARCHITECTURE.md ADRs/ RUNBOOK.md RLS.md EVENTS.md …
```

### 2.2 Dependency rules

```
app → features → (domain | services | shared)
domain → (nothing from app/features/services; clock injected)
features/* → only other features via their index.ts
components → hooks → feature api/ → services
```

CI enforces with dependency-cruiser (Phase 1+).

### 2.3 State split

| Concern | Home |
|--|--|
| Server data | TanStack Query (+ repositories) |
| UI/session/prefs | Thin Zustand slices (not persisted server entities) |
| XP/badges/streak display | Read-only projections from server ledger / attendance |
| Nav | Pure reducer + optional persisted stack (versioned TTL) |
| Offline | Generalized mutation queue (attendance + homework) |

### 2.4 AI / security

- Client **never** holds model keys
- All Gemini via authenticated proxy (rate limit, budget, guardrails, PII redaction)
- RLS matrices + automated tests; Storage signed URLs
- Demo50 behind `isDemoAccount()` in `src/dev`

---

## 3. Current → target file mapping (student-critical)

Moves are **`git mv` first** (Phase 2); logic extraction follows with characterization tests.

| Current | Target |
|--|--|
| `features/student-app/StudentApp.tsx` | `app/shell/StudentApp.tsx` |
| `StudentTopBar.tsx` / `StudentBottomNav.tsx` | `app/shell/` |
| `components/AskOrbitSheet.tsx` | `app/shell/` + `features/ask-orbit/` |
| `StudentNavContext.tsx` + `studentNav.ts` | `app/nav/` (reducer + React adapter) |
| `screens/HomeToday.tsx` | `features/home/` |
| `screens/LearnHub.tsx`, `Subject*`, `UpcomingScreen.tsx` | `features/learn/` |
| `screens/GrowHub.tsx`, `InterestsDetail.tsx` | `features/grow/` |
| `screens/MeHub.tsx`, `SchoolRecordsScreen.tsx`, `PortfolioDetail.tsx` | `features/me/` |
| `screens/SettingsScreen.tsx` | `features/settings/` |
| `screens/StudentAnnouncements.tsx` | `features/notifications/` |
| `features/student/StudyAssistant.tsx` | `features/ask-orbit/` |
| `features/shared/ScannerPanel.tsx` | `features/scan/` |
| `features/student/{Assignments,Schedule,Academics,…}Panel.tsx` | `features/learn/components/` (embedded Level 2/3; no visual change) |
| `store/orbitStore.ts` (split) | Zustand slices under `app`/`shared` + Query hooks under features |
| `lib/{schoolOps,attendance,grades,syllabus,timetable,staff,notifications}Api.ts` | `features/*/api` repositories + `services/supabase` |
| `lib/gemini.ts` client key path | **delete client key path**; `services/ai` → proxy only |
| `lib/sampleData.ts` + `data/demo.ts` | `src/dev/fixtures` + build flag / demo account |
| Streak / priority / continue helpers in screens | `domain/streak`, `domain/priority`, `domain/continue` |
| `lib/attendanceQueue.ts` | `services/offline/` generalized queue |
| `i18n/` | `shared/i18n/` |
| `types/index.ts` | split → `shared/types` + feature `model/` + generated DB types |
| `api/gemini.ts` | Harden as sole AI entry (Edge or Vercel); keep offline fallbacks client-side without keys |
| `capacitor.config.ts` | Env-driven; release script fails if `server.url` set |

### Likely dead / demote (confirm before delete)

| File | Reason |
|--|--|
| `features/student/StudentDashboard.tsx` | Replaced by `StudentApp` hubs; verify zero imports |
| Desktop `Sidebar`/`Header` student branches | Non-student shell only after routing check |

---

## 4. Phase alignment (reminder)

| Phase | Outcome |
|--|--|
| **0** | This document + `audit.md` |
| **1** | Tooling gates, typed env, CI, tests harness |
| **2** | Folder moves, domain extraction, store slice split (UI identical) |
| **3** | Query data layer, stop persisting server data, `useNow` |
| **4** | AI proxy-only, XP ledger, RLS tests, demo isolation |
| **5** | Nav reducer, Android back/restore/deep links, push split |
| **6** | Logging/analytics/flags |
| **7** | Consent / export / erasure foundations |
| **8** | Attempts/mastery schema + pure domain (no UI) |
| **9** | Deep tests, release engineering, ADRs/runbook |

---

## 5. Non-goals (until explicitly scheduled)

- Visual redesign of Home / Learn / Grow / Me
- New student tabs or fee surfaces
- Rewriting parent/teacher/school UX (except shared substrate required by student hardening)

---

*Phase 0 complete. Do not start Phase 1 until instructed.*
