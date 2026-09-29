# Orbit Student — Phase 0 Audit

**Date:** 2026-09-29  
**Scope:** Student experience only (`StudentApp` + nested surfaces)  
**Constraint:** No destructive changes in this phase

---

## A. Current architecture summary

### Stack
| Layer | Choice |
|--|--|
| App | Vite + React 19 + TypeScript + Tailwind 4 |
| State | Zustand (`orbitStore`, `authStore`) — single fat client store |
| Backend | Supabase (Auth, Postgres, Storage) + Gemini (study/scan) |
| Mobile wrap | Capacitor Android (`android/`, live-reload to Vite) |
| Routing | **No URL router** — in-memory stack via `StudentNavContext` |
| i18n | `src/i18n` (en/te) — partially used in legacy panels |

### Entry
- `AuthGate` → `AppShell`
- If `role === 'student'` → **`StudentApp`** (4-tab mobile shell)
- Other roles keep sidebar + `MainContent` tab map

### Student shell (`src/features/student-app/`)
```
StudentApp
├── StudentTopBar     (Orbit / back + bell + theme + logout — always)
├── StudentScreen     (switch on stack destination)
├── StudentBottomNav  (Home | Learn | Grow | Me)
└── ToastHost
```

Nav model: `tab` + `stack: StudentDestination[]` (max depth ≈ root + 1).  
Push resets to `[root, dest]` — **no multi-level subject → topic → homework stack yet**.

### Hub screens vs legacy panels
| Hub | Status vs target IA |
|--|--|
| **HomeToday** | Close to Next/Priority/Today/Progress; Today list still mixes completed items; attendance-streak as progress |
| **LearnHub** | Has Continue + subjects, then **Study Tools = 8 equal rows** (feature directory) — **violates §5** |
| **GrowHub** | Interests + For You + Explore rows; interest chip overload risk; quiz wrongly linked from Grow |
| **MeHub** | Identity + learning + achievements; attendance % chip on hero; School Records not grouped; “Full academic profile” CTA |

Nested destinations mostly **rehost desktop `Panel`/`Card` surfaces** (`AssignmentsPanel`, `SyllabusExplorer`, `StudyAssistant`, `ScannerPanel`, etc.) without mobile IA redesign.

### What already works (preserve)
- Hydration from Supabase (ops, attendance, grades, curriculum, timetable, teachers, competitions)
- Homework tasks start/complete + XP/badges
- Syllabus chapters/subtopics + notes + AI prompt bridge
- Paper scan / paper coach (`ScannerPanel`, `paperCoach`, Gemini)
- Study assistant (`StudyAssistant`, `gemini`, `aiGuardrails`)
- GK quiz, competitions + enrollments, extracurriculars
- Academic profile (rich `StudentAcademicProfile`), confidential docs
- Attendance read-only history, academics/grades panel
- Notifications + alert preferences
- Capacitor Android project + local emulator toolchain docs

---

## B. Proposed architecture

### Information architecture (source of truth)
```
ORBIT STUDENT
├── HOME → Next · Priority · Today · Progress (glance only)
├── LEARN → Continue · Subjects · Upcoming
│     └── Subject → Topics · Homework · Assessments · Resources · Progress
│           (+ Ask Orbit / Scan contextual)
├── GROW → Interests (≤4) · For You · Explore
│     └── Competitions · Clubs · Projects · Challenges · Workshops
└── ME → Identity · Learning & Skills · Achievements · Projects · Portfolio
      └── School Records → Attendance · Progress reports · Teachers · Learning profile
```

### Global (not bottom tabs)
Ask Orbit · Notifications drawer · Search (later) · Settings (theme, logout, prefs)

### Code shape (target)
```
src/features/student-app/
  shell/          StudentApp, BottomNav, TopBar, Settings
  nav/            StudentNavContext (multi-level stack + params)
  home/
  learn/          LearnHub, Upcoming, SubjectHome, Subject* sections
  grow/
  me/             MeHub, SchoolRecords, LearningProfile, Portfolio
  intelligence/   AskOrbitSheet, insight cards (contextual)
  components/     orbit/ + ui/ (PriorityCard, SubjectItem, …)
```

Legacy panels become **Level 2/3 bodies** inside subject/context shells — not primary Learn links.

### Nav stack upgrade
Support params, e.g. `push({ dest: 'subject', subjectId })` → `push({ dest: 'homework', subjectId, taskId })`.  
Keep bottom tabs; hide bottom nav on deep Level 3 if needed for focus (optional Phase 8).

---

## C. Current → proposed route mapping

| Current destination | Proposed home | Notes |
|--|--|--|
| `home` | Home | Tighten Today (collapse completed); quiet progress |
| `learn` | Learn hub | Remove Study Tools directory |
| `homework` | Learn → Subject → Homework **or** Continue deep-link | Global HW list only as “View all” |
| `schedule` | Learn → Upcoming / Next on Home | Not a Learn root tool |
| `syllabus` | Learn → Subject → Topics/Resources | Per-subject, not all-syllabus dump as primary |
| `study-assistant` | Contextual Ask Orbit | Entry from subject/HW/scan — not Learn root |
| `scanner` | Contextual from HW/Assessment submit/review | Not Learn root |
| `gk-quiz` | Grow Explore → Challenges **or** Home caught-up CTA | Not Learn root |
| `academics` / `assessments` | Subject → Assessments; Me → School Records → Progress reports | Split use cases |
| `calendar` | Learn → Upcoming → Calendar | Contextual |
| `competitions` | Grow → Explore / For You | Keep panel as detail |
| `extracurriculars` | Grow → Explore → Clubs | |
| `interests` | Grow → Interests manage | Cap visible chips at 3–4 |
| `profile` | Me → Learning profile (rename) | Demote “Full academic profile” |
| `attendance` | Me → School Records → Attendance | Off Me hero |
| `achievements` | Me → Achievements see-all | |
| `teachers` | Me → School Records → Teachers | |
| `portfolio` | Me → Portfolio | |
| `alerts` | Global notifications drawer from Home | Not a faux “tab” feel |
| *(missing)* `subject` | **New** Learn → Subject home | Critical gap |
| *(missing)* `settings` | **New** Me → Settings | Theme/logout move here |
| *(missing)* `ask-orbit` | **New** sheet/route contextual | |
| *(missing)* `school-records` | **New** Me section | |

**No functionality deleted** — only relocated / re-parented.

---

## D. Components that can be reused

| Asset | Reuse how |
|--|--|
| `StudentBottomNav` | Keep 4 tabs; polish active state |
| `StudentNavContext` | Extend for multi-level + params |
| `SaUi` (`SaCard`, `SaRow`, `SaSection`, `SaChip`, `SaPrimaryButton`) | Evolve into `orbit/` primitives; reduce card overuse |
| `HomeToday` logic | Keep priority/next algorithms; rewrite presentation |
| `InviteRedeemCard` | Home when unlinked |
| `AssignmentsPanel`, `SchedulePanel`, `AcademicsPanel`, `AttendancePanel`, `AchievementsPanel`, `CompetitionsPanel`, `ExtracurricularPanel`, `GkQuizPanel`, `StudyAssistant`, `ScannerPanel`, `CalendarView`, `AcademicProfile`, `TeachersPanel`, `SyllabusExplorer` | Embed as Level 2/3 content under new shells |
| `EmptyState`, `ToastHost`, brand tokens / `index.css` student-app styles | Keep |
| Store selectors + `*Api.ts` + Gemini/paperCoach | Keep — no backend rewrite |
| `.cursor/rules/orbit-student-ia.mdc` | Update to match this audit’s stricter Learn/Subject rules |

---

## E. Components that should be refactored

| Asset | Why |
|--|--|
| `LearnHub` | Remove feature directory; Continue + Subjects + Upcoming only |
| `HomeToday` | Collapse completed Today items; one progress signal; no announcement card noise if unread→bell only |
| `GrowHub` | Cap interests; trustworthy For You reasons; Explore taxonomy; remove quiz-as-Grow-tool misuse or rehome cleanly |
| `MeHub` | School Records group; remove attendance/XP competing hero clutter; rename profile path |
| `StudentTopBar` | Per-tab chrome; theme/logout → Settings |
| `StudentScreen` | Parametric routes (`subject`, `settings`, `school-records`) |
| `SyllabusExplorer` | Split into subject-scoped Topics/Resources views |
| `AcademicProfile` | Mobile learning-profile framing vs admin form |
| Desktop `Panel`/`Card` in nested views | Mobile chrome wrappers (back context, one primary CTA) |

---

## F. Components that should be removed/replaced (from primary UX)

| Surface | Action |
|--|--|
| Learn “Study tools” 8-row menu | **Remove from Learn root** (relocate) |
| Learn “Today” 3-stat tiles as module jumpers | Replace with Upcoming list |
| Permanent theme + logout on every top bar | Move to Settings |
| Me hero attendance % as peer to streak/XP | Demote to School Records / conditional alert |
| “Full academic profile” as primary link label | Replace with Learning profile |
| Grow linking `gk-quiz` as Explore peer to Clubs | Challenges bucket or contextual only |
| Legacy `StudentDashboard` (sidebar era) | Already unused by `StudentApp` — leave until parent/teacher cleanup; do not revive for students |
| Equal-weight card walls | Replace with card / list / inline patterns |

---

## G. Data / API dependencies

| Domain | Store / API | Subject-home readiness |
|--|--|--|
| Homework | `tasks`, school ops hydrate | Filter by `task.subject` |
| Timetable / Next | `timetableByDay`, `deriveTodayTimeline` | Ready for Home Next + Upcoming |
| Curriculum / topics | `curriculum: SyllabusChapter[]` (`subject`, subtopics, notes) | **Primary source for Subject → Topics** |
| Grades / assessments | `studentGrades` | Thin model (math/science/chem strings) — Subject progress approximate until richer schema |
| Attendance | `attendanceRecords`, `getAttendancePercent` | School Records only |
| Profile / interests / projects / achievements | `studentProfile` | Grow + Me |
| Competitions | `competitions`, `competitionEnrollments` | Grow For You — **must validate reason strings against actual interest match** |
| Clubs / activities | Extracurricular ops surfaces | Grow Explore |
| Teachers | `teachers` | School Records |
| Calendar | `calendarEvents` | Upcoming |
| Notifications | `notifications` | Global drawer |
| AI | `StudyAssistant`, `setAiPrompt`, Gemini | Contextual Ask Orbit |
| Scan | `ScannerPanel`, `paperCoach` | Contextual from HW/assessment |
| Auth / link | `authStore`, `classLinked`, `linkedStudent` | Unchanged |

**Gaps (product, not blockers for Phase 1–2):**
- No first-class `Subject` entity beyond string grouping
- No workshops/challenges tables (map Challenges → quiz + comps; Workshops → placeholder/empty)
- Recommendation engine is heuristic (first open competition + first interest) — trustable copy required
- No URL deep links / shareable subject routes yet

---

## H. Implementation plan

Aligned to the requested phases; **no Phase 1+ code in this audit**.

| Phase | Goal | Exit criteria |
|--|--|--|
| **0 Audit** | This document | Shared source of truth |
| **1 IA / nav** | Extend stack + params; Settings; School Records route; stop Learn tool directory links | All features reachable; 4 tabs only |
| **2 Home** | Daily briefing only; collapse completed Today | 5-second comprehension |
| **3 Learn** | Continue · Subjects · Upcoming | No feature directory |
| **4 Subject** | Subject home + section nav wrapping existing panels | HW/Scan/AI contextual entry points |
| **5 Grow** | Interests ≤4, For You with honest reasons, Explore | No false “why” copy |
| **6 Me** | Identity → growth → School Records | Attendance not co-equal to identity |
| **7 Global** | Notifications drawer, Settings, Ask Orbit sheet, empty/loading/error | Human states everywhere |
| **8 Mobile polish** | Safe area, bottom inset, touch, one-hand, nested Panel chrome | No collision with bottom nav |

### Risk controls
- Preserve `orbitStore` APIs; adapt UI only
- Feature-flag optional if needed; prefer incremental PR-sized steps on `main`
- Update `orbit-student-ia.mdc` when Phase 1 starts so Cursor agents don’t regenerate the Study Tools menu

### Immediate next step after approval
**Phase 1** — nav + destination map + Settings + School Records shell + Learn hub IA strip (no Subject deep build yet).

---

## Current problems (priority)

1. **Learn is an ERP feature directory** (highest product risk)
2. **No Subject container** — academic depth has nowhere natural to live
3. **Top bar utility clutter** wastes glance space
4. **Card-heavy / equal-weight CTAs** raise cognitive load
5. **Me mixes identity with admin** (attendance on hero)
6. **Grow recommendation trust** fragile
7. **Legacy Panel UIs** feel like desktop inside mobile stack
8. **Single-level nav** cannot express Subject → Homework → Scan

## Verdict

The **four-tab shell is the right skeleton**. The product is still **~40% ERP-wrapped** because Learn/Me expose modules and tools as peers. Phase 0 complete: proceed to Phase 1 without deleting capabilities — **rehome and deepen**.
