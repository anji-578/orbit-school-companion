import * as Sentry from '@sentry/react'
import { getPublicEnv } from '@/shared/config/env'

/**
 * Sentry chosen over alternatives because:
 * - Mature React 19 / Vite source-map upload tooling
 * - Built-in PII scrubbing hooks
 * - Works for web + Capacitor WebView without a second vendor
 * Source maps are uploaded in CI (auth token) and are NOT served from dist/.
 */
export function initSentry(): void {
  const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim()
  if (!dsn) return
  const env = getPublicEnv()
  Sentry.init({
    dsn,
    environment: env.MODE || 'development',
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.user) {
        event.user = {
          id: event.user.id ? String(event.user.id).slice(0, 16) : undefined,
        }
      }
      if (event.request?.headers) {
        delete event.request.headers.Authorization
        delete event.request.headers.cookie
      }
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'console') return null
      return breadcrumb
    },
  })
}
