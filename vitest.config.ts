import { defineConfig } from 'vitest/config'
import path from 'node:path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/shared/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'api/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/domain/**/*.ts', 'src/app/nav/**/*.ts', 'src/services/offline/**/*.ts'],
    },
  },
})
