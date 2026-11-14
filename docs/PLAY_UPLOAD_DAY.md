# Play upload day — close the loop

Engineering is on `main` after the Play hardening merge. This is the operator checklist for Console steps that cannot run in CI.

## 0) Preflight (laptop)

```bash
cd ~/orbit   # or your clone
git checkout main && git pull
npm ci
npm run check
npm run check:prod-ready
bash scripts/backup-play-keystore.sh   # → ~/Orbit-Play-Secrets
npm run android:aab
```

Confirm:

- `android/app/build/outputs/bundle/release/app-release.aab` exists
- Keystore backup folder exists and is offline-copied
- Production legal URLs load (replace host):

  - `https://<PROD_HOST>/legal/privacy.html`
  - `https://<PROD_HOST>/legal/terms.html`
  - `https://<PROD_HOST>/legal/delete-account.html`

## 1) Vercel production env (required)

In Vercel → Project → Settings → Environment Variables → **Production** only:

| Set | Do not set |
|-----|------------|
| `VITE_SUPABASE_URL` | `ORBIT_DEV_AI_OPEN` |
| `VITE_SUPABASE_ANON_KEY` | `ORBIT_ALLOW_DEMO_ENSURE` |
| `GEMINI_API_KEY` | `VITE_ENABLE_DEMO_FIXTURES` |
| `VITE_SENTRY_DSN` | `VITE_GEMINI_API_KEY` |
| Server Supabase keys as already used by API routes | |

Redeploy production after env changes.

Verify with:

```bash
ORBIT_ASSERT_PROD_ENV=1 \
  VITE_SENTRY_DSN=… GEMINI_API_KEY=… \
  npm run check:prod-ready
```

## 2) Google Play Console (human)

1. Pay / open [Play Console](https://play.google.com/console)
2. Create app → name **Orbit**, package **`app.orbit.student`**
3. Dashboard → **Testing → Closed testing** → create track `pilot-1000`
4. Upload `app-release.aab`; use Play App Signing (upload key = local keystore)
5. Store listing:
   - Short/full description
   - Screenshots (phone)
   - Privacy policy URL → `https://<PROD_HOST>/legal/privacy.html`
6. **App content → Data safety** — account info, app activity, diagnostics; not sold; deletion URL → `/legal/delete-account.html`
7. **Target audience** — school / education; complete Families questions honestly
8. Add testers (school emails / Google Group)
9. Roll out closed test → install from Play on 2–3 devices

## 3) Device smoke (30 min)

- [ ] Fresh install from closed track
- [ ] School student sign-in (Supabase account — not local demo)
- [ ] Home · Learn · Grow · Me navigate
- [ ] Ask Orbit returns an answer
- [ ] Settings → Profile visibility → Export my data
- [ ] Privacy ack appears once on first launch
- [ ] Airplane mode → offline UI does not crash
- [ ] Sentry receives a test event (optional: trigger a handled error)

## 4) ~1000-student live demo

- [ ] Roster provisioned (school CSV or `npm run pilot100:provision` against **prod** project only with explicit approval)
- [ ] School admin knows deletion requests land in `audit_log` and `anonymize_student` completes erasure
- [ ] Support channel monitored
- [ ] Production rollout: 10% → 50% → 100% only after closed test is clean

## Explicitly still human (cannot automate)

- Play developer account payment / identity verification
- Final counsel sign-off on Privacy/Terms for school contracts
- Creating a brand-new dedicated prod Supabase project (recommended when leaving shared demo cloud)
- Monitoring `privacy@orbit.app` / `support@orbit.app` mailboxes
