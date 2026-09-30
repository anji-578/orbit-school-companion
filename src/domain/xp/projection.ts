/**
 * Client XP is a read-only projection of the server ledger.
 * Mutations that invent points are forbidden on the client.
 */
export type XpProjection = {
  totalXp: number
  unlockedBadges: string[]
}

/** Apply a server-provided projection (replace, never accumulate). */
export function applyXpProjection(_prev: XpProjection, next: XpProjection): XpProjection {
  return {
    totalXp: Math.max(0, Math.floor(next.totalXp)),
    unlockedBadges: [...next.unlockedBadges],
  }
}

/**
 * Client cannot raise XP. Any additive request is rejected (returns previous).
 * Used by characterization tests and as the only allowed client XP API.
 */
export function rejectClientXpIncrease(prev: XpProjection, attemptedDelta: number): XpProjection {
  if (attemptedDelta !== 0) return prev
  return prev
}
