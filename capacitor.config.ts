import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.orbit.student',
  appName: 'Orbit',
  webDir: 'dist',
  server: {
    // Live-reload against Vite while testing on emulator (host loopback from AVD)
    // Comment out `url` for production APK builds that ship static assets.
    url: 'http://10.0.2.2:5173',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
}

export default config
