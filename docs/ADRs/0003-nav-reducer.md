# ADR 0003 — Student navigation approach

## Status

Accepted

## Context

In-memory nav lacked Android back handling and process-death restore.

## Decision

- Pure reducer in `src/app/nav` with characterization tests.
- React adapter keeps the same public API.
- Persist stack with 12h TTL; Capacitor `backButton` closes sheet → pop → Home → exit.
- Deep links via `orbit://` / `/d/` resolver.

## Consequences

No URL router yet; deep links map into the existing stack model.
