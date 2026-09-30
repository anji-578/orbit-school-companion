# ADR 0004 — Event / purpose policy

## Status

Accepted

## Context

Analytics without purpose tags risks engagement creep and privacy issues for minors.

## Decision

- Every `track()` event carries a purpose: learning_support | safety | product_quality | operations.
- Catalogue in `docs/EVENTS.md`; no free-text/PII properties.
- Engagement-only events require explicit human approval.

## Consequences

Smaller event set; vendor wiring deferred to staging.
