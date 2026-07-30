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

## Architecture (current)

```
src/
  store/orbitStore.ts
  i18n/
  lib/
  data/demo.ts
  components/
  features/
```

Demo Mode: payments/SMS/GPS simulated. AI uses Gemini if `VITE_GEMINI_API_KEY` is set; otherwise offline demos.
