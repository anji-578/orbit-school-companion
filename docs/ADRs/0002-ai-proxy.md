# ADR 0002 — AI proxy architecture

## Status

Accepted

## Context

Client `VITE_GEMINI_API_KEY` can ship in the browser bundle.

## Decision

- All Gemini calls go through authenticated `/api/gemini`.
- Server uses `GEMINI_API_KEY` only (no VITE fallback).
- Client offline tutor/quiz remain keyless fallbacks.
- Production boot throws if `VITE_GEMINI_API_KEY` is set.

## Consequences

Requires server env configuration; demo without proxy still gets offline answers.
