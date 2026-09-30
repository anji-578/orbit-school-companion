import { z } from 'zod'

const purposeSchema = z.enum(['learning_support', 'safety', 'product_quality', 'operations'])

export type AnalyticsPurpose = z.infer<typeof purposeSchema>

const eventCatalogue = {
  homework_started: { purpose: 'learning_support' as const },
  homework_completed: { purpose: 'learning_support' as const },
  ask_orbit_opened: { purpose: 'learning_support' as const },
  nav_tab_changed: { purpose: 'product_quality' as const },
  offline_mutation_flushed: { purpose: 'operations' as const },
} as const

export type AnalyticsEvent = keyof typeof eventCatalogue

export function track(event: AnalyticsEvent, props: Record<string, string | number | boolean> = {}) {
  const meta = eventCatalogue[event]
  // Intentionally no free-text / PII. Wire to a vendor in Phase 6 staging.
  if (!import.meta.env.PROD) {
    // deferred to logger to avoid console.log lint
    void meta
    void props
  }
}

export function eventPurpose(event: AnalyticsEvent): AnalyticsPurpose {
  return eventCatalogue[event].purpose
}
