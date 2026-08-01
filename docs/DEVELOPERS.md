# Orbit · Developer notes

Operational setup (not part of the product README).

## Local

```bash
npm install
npm run dev
```

## Supabase SQL order

1. `supabase/schema.sql`
2. `supabase/trust_hardening.sql`
3. `supabase/seed.sql`
4. `supabase/homework_completions.sql`
5. `supabase/rls_recursion_fix.sql` (breaks students ↔ parent_links RLS loop)
6. `supabase/fees_ledger.sql`
7. `supabase/timetable.sql`
8. `supabase/sample_catalog.sql`
9. `supabase/students_insert_policy.sql` (school CSV roster import)
10. `supabase/alerts.sql`
11. `supabase/notifications_student_scope.sql` (child-scoped alerts via `student_id`)
12. `supabase/school_policy_and_homework_class.sql` (active class policy + homework `class_name`)
13. `supabase/storage.sql`
14. Optional: `supabase/notifications_rls.sql`

Pilot invite codes (after seed): `SUNRISE-STU-8A`, `SUNRISE-PAR-8A`, `SUNRISE-TCH-8A`, `SUNRISE-ADM`

## Deploy (Vercel)

Connect the GitHub repo to Vercel. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optional notify/Gemini keys.

Auth: turn **OFF** email confirm for demos. Add redirect URLs for password reset.

## Alerts (Push + SMS)

1. Run `supabase/alerts.sql`
2. `npx web-push generate-vapid-keys`
3. Set `VITE_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Optional SMS: `MSG91_*` after DLT approval

`/api/notify` needs a signed-in JWT or `x-orbit-notify-secret`.
