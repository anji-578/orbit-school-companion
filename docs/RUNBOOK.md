# Orbit — runbook

## Environments

| Env | Supabase | App host | Notes |
|--|--|--|--|
| local | `supabase start` | Vite `127.0.0.1:5173` | Migrations applied locally only |
| staging | separate project | Vercel preview / staging | Use staging keys |
| prod | separate project | Vercel production | Tag deploy + approval |

Never apply experimental SQL to prod from a laptop.

## Incidents

### AI outage

1. Confirm `/api/gemini` 5xx in Vercel logs.
2. Flip feature flag `aiKillSwitch` (client) / disable proxy env.
3. Students still get offline tutor/quiz fallbacks.
4. Check `GEMINI_API_KEY` (server-only) and quotas.

### Supabase outage

1. App shows last hydrated UI; offline queue retains attendance/homework mutations.
2. Do not wipe localStorage.
3. When restored, resume + online events flush queues.

### Bad release

1. Revert Vercel deployment to previous production deployment.
2. If Capacitor store build: halt staged rollout; ship hotfix AAB.
3. Run `npm run cap:release:check` before any store build.

### Key rotation

1. Rotate Gemini / Supabase service role / VAPID private in host secrets.
2. Never put secrets in `VITE_*`.
3. Rebuild without client key material; grep `dist` for `AQ.` / `GEMINI`.

### Breach response

1. Revoke compromised keys.
2. Export audit logs; notify school contacts per contract.
3. Run DSAR / anonymize paths if required (`export_student_data`, `anonymize_student`).

## Android release checklist

1. `npm run check` (includes `check:android-release` + `check:cap-release`)
2. Confirm `capacitor.config.ts` has no `server.url` (`npm run cap:release:check`)
3. Ensure `android/key.properties` exists (`npm run android:keystore` once)
4. `npm run android:aab` → upload `android/app/build/outputs/bundle/release/app-release.aab`
5. Bump `versionCode` in `android/app/build.gradle` for every store upload
6. Play Data safety + Families policy + privacy URL (`/legal/privacy.html`) — see `docs/PLAY_STORE.md`
7. Staged rollout; confirm Sentry release + no spike in auth/AI 5xx

## Production env lockdown

Never set on Vercel **production**:

- `ORBIT_DEV_AI_OPEN`
- `ORBIT_ALLOW_DEMO_ENSURE`
- `VITE_ENABLE_DEMO_FIXTURES`

Required for a monitored pilot: `VITE_SENTRY_DSN`, server `GEMINI_API_KEY`, prod Supabase URL/anon (and service role server-only).
