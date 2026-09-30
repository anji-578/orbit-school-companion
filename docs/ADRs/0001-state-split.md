# ADR 0001 — State management split

## Status

Accepted

## Context

`orbitStore` mixed UI prefs, server hydration, XP and AI. Persisting server collections caused stale/demo pollution.

## Decision

- TanStack Query owns server state (migration in progress; mega-hydrate still boots data).
- Zustand persists UI/prefs only (`orbit-school-v2` partialize).
- XP display may remain an optimistic cache until `student_xp_totals` Query lands.

## Consequences

Fewer persist bugs; temporary dual-read period while repositories replace hydrate.
