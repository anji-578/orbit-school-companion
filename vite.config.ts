import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production' && env.VITE_GEMINI_API_KEY?.trim()) {
    const msg =
      'VITE_GEMINI_API_KEY is set. Remove it — use server-only GEMINI_API_KEY with /api/gemini.'
    if (process.env.CI === 'true' || process.env.ORBIT_STRICT_ENV === '1') {
      throw new Error(msg)
    }
    console.warn(`[vite] ${msg}`)
  }

  const sentryPlugins =
    env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT
      ? [
          sentryVitePlugin({
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            authToken: env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              filesToDeleteAfterUpload: ['**/*.map'],
            },
          }),
        ]
      : []

  return {
    plugins: [react(), tailwindcss(), ...sentryPlugins],
    base: './',
    build: {
      // Maps uploaded to Sentry then deleted; never served publicly when token is configured.
      sourcemap: Boolean(env.SENTRY_AUTH_TOKEN),
    },
    resolve: {
      alias: {
        '@/app': path.resolve(__dirname, 'src/app'),
        '@/features': path.resolve(__dirname, 'src/features'),
        '@/domain': path.resolve(__dirname, 'src/domain'),
        '@/services': path.resolve(__dirname, 'src/services'),
        '@/shared': path.resolve(__dirname, 'src/shared'),
        '@/dev': path.resolve(__dirname, 'src/dev'),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
  }
})
