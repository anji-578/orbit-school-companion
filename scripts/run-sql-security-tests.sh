#!/usr/bin/env bash
# Apply harness + migrations + SQL assertion tests against DATABASE_URL (default local CI postgres).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/postgres}"

psql_cmd() {
  psql "$DB" -v ON_ERROR_STOP=1 "$@"
}

echo "[sql-tests] harness"
psql_cmd -f "$ROOT/supabase/tests/00_harness.sql"
psql_cmd -f "$ROOT/supabase/tests/01_assert.sql"

echo "[sql-tests] migrations"
psql_cmd -f "$ROOT/supabase/migrations/20260930120000_xp_events.sql"
psql_cmd -f "$ROOT/supabase/migrations/20260930121000_consents.sql"
psql_cmd -f "$ROOT/supabase/migrations/20260930122000_mastery_foundation.sql"
psql_cmd -f "$ROOT/supabase/migrations/20260930123000_dsar_export_erasure.sql"
psql_cmd -f "$ROOT/supabase/migrations/20260930124000_secure_definer_hardening.sql"

# Force RLS on ledger tables for isolation tests
psql_cmd -c "alter table public.xp_events force row level security; alter table public.student_badges force row level security; grant select on public.xp_events, public.student_badges, public.student_xp_totals to authenticated;"

echo "[sql-tests] security definer"
psql_cmd -f "$ROOT/supabase/tests/02_security_definer.sql"
echo "[sql-tests] isolation"
psql_cmd -f "$ROOT/supabase/tests/03_isolation.sql"
echo "[sql-tests] OK"
