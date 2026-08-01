# Orbit · My School Companion

Long-term K-12 school companion SPA (Student / Parent / Teacher / School).

## Run locally

```bash
npm install
npm run dev
```

## Share a live link with teammates (low budget)

### Option A — Free public URL (best for demos) · **₹0**

Deploy to [Vercel](https://vercel.com) (Hobby plan is free):

1. Push this repo to GitHub (or import the folder in Vercel).
2. In Vercel: **Add New Project** → import repo → Deploy.
3. Share the URL, e.g. `https://orbit-xxxx.vercel.app`.

Every push to `main` can auto-update the link. Teammates open it on laptop or phone.

CLI alternative (after `npm i -g vercel` and login):

```bash
npm run build
vercel --prod
```

### Option B — Same Wi‑Fi only · **₹0**

```bash
npm run dev:share
```

Vite prints a Network URL like `http://192.168.x.x:5173`. Teammate on the same Wi‑Fi opens that on their phone.

### Option C — Quick tunnel from your laptop · **₹0**

Keep `npm run dev` running, then in another terminal:

```bash
npx localtunnel --port 5173
# or: npx cloudflared tunnel --url http://localhost:5173
```

Share the temporary HTTPS URL. Good for a meeting; not for a permanent demo link.

---

## Use / test on mobile (without App Store)

Orbit is a **web app + PWA**. You do **not** need Play Store / App Store for demos.

1. Deploy with Option A (Vercel).
2. Open the URL in **Chrome (Android)** or **Safari (iPhone)**.
3. **Add to Home Screen**:
   - Android Chrome → menu → **Install app** / Add to Home screen  
   - iPhone Safari → Share → **Add to Home Screen**
4. It opens fullscreen like an app (manifest + icons are already set up).

Native Store apps (React Native / Capacitor) come later and cost more time — skip for V1.

---

## What you need to deploy + cost (start cheap)

| Piece | Need it for teammate demo? | Monthly cost |
|--|--|--|
| **Vercel Hobby** | Yes — public HTTPS link | **₹0** |
| **GitHub** | Yes — store code / connect Vercel | **₹0** |
| Custom domain | Optional | ~₹500–1,000 / year |
| Supabase | When you add real login/DB | **₹0** free tier to start |
| Razorpay / SMS / Gemini | Later features | Pay-as-you-go |

**Minimum to show progress today:** GitHub + Vercel = **₹0**.

---

## Demo login (until Supabase)

Open the live site → pick a profile → sign in:

| Profile | Email | Password |
|--|--|--|
| Student | `student@orbit.app` | `student123` |
| Parent | `parent@orbit.app` | `parent123` |
| Teacher | `teacher@orbit.app` | `teacher123` |
| School | `admin@orbit.app` | `admin123` |

**Supabase Auth setting (required for demos):** Authentication → Providers → Email → turn **OFF** “Confirm email”, then retry login (first login auto-creates the user).

**Password reset + branded email**
1. Authentication → URL Configuration → add your Vercel URL (and `http://localhost:5173`) to **Redirect URLs**.
2. Authentication → Email Templates → **Reset password**: set subject to `Orbit · Reset your password`, and body like:

```html
<h2>Orbit · My School Companion</h2>
<p>Reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Set a new password</a></p>
```

3. In the app: Sign in → **Forgot password?** → open the email → set a new password on the recovery screen.

When you create a Supabase project: paste URL + anon key into `.env` / Vercel env, then run SQL in order:

1. `supabase/schema.sql`
2. `supabase/trust_hardening.sql` (invites, syllabus sync, tighter RLS)
3. `supabase/seed.sql` (Sunrise + Ananya + invite codes)
4. `supabase/homework_completions.sql` (per-student homework tracking)
5. `supabase/fees_ledger.sql` (UTR ↔ student link for class fee ledger)
6. `supabase/timetable.sql` (Grade 8-A week schedule)
7. `supabase/sample_catalog.sql` (staff directory + sample leaves/broadcasts/calendar/grades)
8. `supabase/alerts.sql` (push/SMS + notification bell RLS)
9. `supabase/storage.sql` (syllabus note files bucket)
10. Optional re-run: `supabase/notifications_rls.sql` if alerts.sql was applied earlier without bell policies

**Teammate demos:** tabs stay filled with sample data when live rows are empty. A “Sample data” badge appears in the header until real school data replaces it.

**Confirm live:** open any role → **Alerts** → “Live system check” (seed, trust, alerts, storage, VAPID).

**Pilot invite codes (after seed):** `SUNRISE-STU-8A`, `SUNRISE-PAR-8A`, `SUNRISE-TCH-8A`, `SUNRISE-ADM`

**Notify API:** `/api/notify` requires a signed-in user JWT (`Authorization: Bearer …`) or `x-orbit-notify-secret` matching `NOTIFY_INTERNAL_SECRET`.

---

## Architecture (current)

```
src/
  auth/                 # landing → login → session gate
  AppShell.tsx
  store/orbitStore.ts
  i18n/
  lib/
  data/demo.ts
  features/
api/
  gemini.ts             # Gemini proxy (Edge)
  notify.ts             # Web Push + MSG91 fan-out (Node)
supabase/
  schema.sql            # Phase 0 Postgres + RLS
  alerts.sql            # notifications, push, prefs, sms_log
```

### Alerts (Push + SMS)

1. Run `supabase/alerts.sql` in the Supabase SQL editor.
2. Generate VAPID keys: `npx web-push generate-vapid-keys`
3. Set `VITE_VAPID_PUBLIC_KEY` (client) + `VAPID_PRIVATE_KEY` + `SUPABASE_SERVICE_ROLE_KEY` on Vercel.
4. Optional SMS: `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_TEMPLATE_ID` after India DLT approval.
5. In the app: open **Alerts** → Enable push / opt into SMS.

In-app bell always works. Push/SMS fan-out runs via `POST /api/notify` when keys are set.

Demo Mode: GPS call actions still simulated. AI uses Gemini if configured; otherwise offline demos. SMS is live only when MSG91 is configured — otherwise requests are logged as `skipped`.
