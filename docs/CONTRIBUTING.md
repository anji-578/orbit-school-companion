# Contributing to Orbit

1. Node 22+, `npm ci`, copy `.env.example` → `.env` (never commit `.env`).
2. `npm run dev` — app at `http://127.0.0.1:5173`.
3. Before PR: `npm run check`.
4. Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`.
5. No UI/visual changes unless the task says so (see architecture rule).
6. Database: write migrations under `supabase/migrations/`; apply only to local Supabase.
7. Secrets never use `VITE_` prefixes.
