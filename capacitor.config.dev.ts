import type { CapacitorConfig } from '@capacitor/cli'

/** Emulator live-reload only. Do not use for Play/release APKs. */
const config: CapacitorConfig = {
  appId: 'app.orbit.student',
  appName: 'Orbit',
  webDir: 'dist',
  server: {
    url: 'http://10.0.2.2:5173',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
