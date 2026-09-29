# Android emulator preview (Orbit Student)

## What is ready in the repo

- Capacitor Android shell (`android/`, `capacitor.config.ts`)
- Live-reload points the app WebView at `http://10.0.2.2:5173` (host Vite from the emulator)
- Local JDK + Android SDK + AVD under `.android-toolchain/` (gitignored, ~2.5GB)

## Why Cursor couldn't open the emulator window here

This Mac blocks agent processes from:

1. Emulator CPU features → process dies with **SIGILL** / Qt “neon crc32”
2. Launching **Terminal.app** / **Google Chrome** via `open`

So the toolchain is installed, but **you must start the emulator from your own Terminal**.

## Preview in 2 minutes (your Terminal)

```bash
cd ~/orbit   # or your clone path

# 1) Web server (keep running)
npm run dev -- --host 127.0.0.1 --port 5173

# 2) New terminal tab — boot emulator + install Orbit
bash scripts/android-emulator.sh
```

Login on the emulator:

- Email: `student040@demo50.orbit.app`
- Password: `Demo50!`

You should see **Home · Learn · Grow · Me**.

## Browser fallback (no emulator)

1. Open http://127.0.0.1:5173 in Chrome
2. DevTools → device toolbar (Cmd+Shift+M) → iPhone / Pixel
3. Sign in as the student above

## Notes

- Website vs Android UI are **not fully separated yet** — students get the mobile shell in both.
- For a store APK without live-reload, remove `server.url` from `capacitor.config.ts`, then `npm run cap:sync`.
