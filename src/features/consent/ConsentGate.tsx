import type { ReactNode } from 'react'
import { getFlags } from '@/services/feature-flags'

/**
 * Minimal placeholder when consentGate flag is on.
 * Final UI is a design-phase task — do not restyle here.
 */
export function ConsentGate({ children }: { children: ReactNode }) {
  if (!getFlags().consentGate) return children
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 text-center">
      <p className="text-sm text-[var(--muted)]">Consent required before continuing.</p>
    </div>
  )
}
