import type { CapacitorConfig } from '@capacitor/cli'

/** Production Capacitor config — never include server.url. */
const config: CapacitorConfig = {
  appId: 'app.orbit.student',
  appName: 'Orbit',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
