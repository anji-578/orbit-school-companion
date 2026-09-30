import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Client code must never reference VITE_GEMINI_* (Vite would inline secrets).
  // Fail closed in CI; warn locally so developers can keep a legacy .env while migrating.
  if (mode === 'production' && env.VITE_GEMINI_API_KEY?.trim()) {
    const msg =
      'VITE_GEMINI_API_KEY is set. Remove it — use server-only GEMINI_API_KEY with /api/gemini.'
    if (process.env.CI === 'true' || process.env.ORBIT_STRICT_ENV === '1') {
      throw new Error(msg)
    }
    console.warn(`[vite] ${msg}`)
  }

  return {
    plugins: [react(), tailwindcss()],
    base: './',
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
