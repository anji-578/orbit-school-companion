# Orbit Student — Play Store listing (production pilot)

## What engineering ships

- Package id: `app.orbit.student`
- Version: see `android/app/build.gradle` (`versionName` / `versionCode`)
- HTTPS-only WebView (`usesCleartextTraffic=false` + network security config)
- No cloud backup of app data (`allowBackup=false`)
- Release minify + ProGuard keep rules for Capacitor
- Upload signing via `android/key.properties` (gitignored)
- Legal URLs (host on production web):
  - `/legal/privacy.html`
  - `/legal/terms.html`
  - `/legal/delete-account.html`
- In-app: privacy ack (production), export data, request account deletion

## One-time setup (human)

1. Create [Google Play Console](https://play.google.com/console) developer account (~₹2,100).
2. Create app **Orbit** → package `app.orbit.student`.
3. Generate upload key (once per product):

```bash
bash scripts/generate-upload-keystore.sh
# Store keystore + passwords in a company password manager
```

4. Production env (Vercel + Supabase **prod** project — not demo):
   - `GEMINI_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `VITE_SENTRY_DSN` (+ CI `SENTRY_*` for maps)
   - **Never** set `ORBIT_DEV_AI_OPEN`, `ORBIT_ALLOW_DEMO_ENSURE`, `VITE_ENABLE_DEMO_FIXTURES` on production
5. Apply migrations including `20261114120000_account_deletion_request.sql`.
6. Set Play listing privacy URL to `https://<your-prod-host>/legal/privacy.html`.
7. Data safety form: collect account info, app activity, diagnostics; not sold; deletion URL above.
8. Target audience: select school / education; complete Families / Designed for Families questionnaires honestly (minors).

## Build & upload

```bash
npm run check
npm run check:android-release
bash scripts/build-android-aab.sh
# Upload android/app/build/outputs/bundle/release/app-release.aab
```

Use **closed testing** → 1 school → open testing → production staged rollout (10% → 50% → 100%).

## ~1000-student live demo checklist

- [ ] Separate Supabase prod project; RLS suite green in CI
- [ ] Roster provisioned (`pilot100` scripts or school CSV import)
- [ ] Sentry receiving events from a release build
- [ ] AI rate limits + Gemini quota sized for peak class usage
- [ ] School admin knows how to complete `anonymize_student` after deletion requests
- [ ] Support email monitored (`support@orbit.app` / school channel)
- [ ] Rollback: previous AAB + Vercel redeploy rehearsed once

## Explicitly still human / legal

Counsel review of Privacy/Terms for DPDP, school MSA, and Play Families answers. Engineering provides the pages and deletion path; counsel owns final wording for contracts.
