# Phases 1–9 combined report

**Date:** 2026-09-30  
**Constraint:** No UI/visual redesign; behaviour preservation.

## Summary

Hardened Orbit Student substrate end-to-end: quality gates (Vitest, Prettier, dependency-cruiser, husky, GitHub Actions), path aliases, typed public env, proxy-only Gemini, domain pure functions + tests, nav reducer + Android back + nav persist + deep links, Zustand persist shrink, offline mutation queue, XP/consent/mastery/DSAR migrations, observability stubs, privacy docs, ADRs/runbook. Full physical `git mv` of every screen into feature folders and complete TanStack Query replacement of mega-hydrate are intentionally incremental (facades + bridge hooks) to avoid behaviour regressions.

## Commits

See git history after this push (`chore:`, `feat:`, `refactor:`, `docs:`, `test:`).

## Gates

Run `npm run check` — must be green after this change set.

## Behaviour preservation

Manual smoke checklist:

- [ ] Login as student → Home glance (Next / Priority / Today / streak)
- [ ] Learn → subject → homework; Ask Orbit sheet
- [ ] Grow interests; Me → school records / settings
- [ ] Android back: sheet → pop → Home → exit
- [ ] Offline attendance still queues

## Assumptions

- `noUncheckedIndexedAccess` deferred (too many breakages); `strict` + `noImplicitOverride` on.
- Feature folders expose `index.ts` re-exports; physical moves deferred.
- Client `addXp` remains optimistic cache until ledger Query wired everywhere.
- Playwright smoke is minimal; full e2e matrix deferred without local Supabase in CI.
- Sentry vendor not installed yet — logger wrapper ready; justify install when staging DSN exists.
- FCM Capacitor push scaffold deferred; web-push remains for browsers.
- pgTAP RLS suite deferred until local Supabase CI service.

## Risks / open questions

1. **Rotate Gemini API keys now** if `VITE_GEMINI_API_KEY` was ever present in a developer `.env` used for a production/client build. Fixed: client no longer assigns `import.meta.env` wholesale (that was re-inlining every `VITE_*` into the bundle).
2. Apply new migrations only to local/staging — not prod from this pass.
3. Confirm legacy `StudentDashboard.tsx` deletion in a later cleanup PR.

## Deferred

- Full repository Query migration (drop `hydrateFromSupabase`)
- Physical feature folder moves + orbitStore slice split
- Capacitor FCM + force-update version gate
- Coverage hard-fail thresholds in CI
- Consent gate UI (flag default off)

## Next

Wire homework completion through `award_xp` + Query invalidation; finish store slice split.
