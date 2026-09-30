#!/usr/bin/env bash
# Run SQL security tests against supabase/postgres (real auth.uid / roles).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/postgres}"

psql_cmd() {
  psql "$DB" -v ON_ERROR_STOP=1 "$@"
}

echo "[sql-tests] using DATABASE_URL=${DB%%@*}@***"
echo "[sql-tests] harness"
psql_cmd -f "$ROOT/supabase/tests/00_harness.sql"
psql_cmd -f "$ROOT/supabase/tests/01_assert.sql"

echo "[sql-tests] migrations"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "  apply $(basename "$f")"
  psql_cmd -f "$f"
done

psql_cmd -c "alter table if exists public.xp_events force row level security; alter table if exists public.student_badges force row level security;"

echo "[sql-tests] security definer / XP negatives"
psql_cmd -f "$ROOT/supabase/tests/02_security_definer.sql"
echo "[sql-tests] isolation + RLS-all"
psql_cmd -f "$ROOT/supabase/tests/03_isolation.sql"

echo "[sql-tests] grants/policies evidence dump"
psql_cmd -c "select grantee, table_name, privilege_type from information_schema.role_table_grants where table_schema='public' and table_name in ('xp_events','student_badges','learning_events','xp_award_rules') and grantee in ('authenticated','anon','PUBLIC') order by 1,2,3;"
psql_cmd -c "select schemaname, tablename, policyname, cmd from pg_policies where schemaname='public' and tablename in ('xp_events','student_badges','learning_events') order by 2,3;"

echo "[sql-tests] OK"
