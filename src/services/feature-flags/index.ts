export type FeatureFlags = {
  aiKillSwitch: boolean
  recordAttempts: boolean
  consentGate: boolean
  masteryScheduling: boolean
}

const defaults: FeatureFlags = {
  aiKillSwitch: false,
  recordAttempts: false,
  consentGate: false,
  masteryScheduling: false,
}

let overrides: Partial<FeatureFlags> = {}

export function getFlags(): FeatureFlags {
  const merged = { ...defaults, ...overrides }
  // Production builds always require privacy acknowledgment unless explicitly overridden off in tests.
  if (import.meta.env.PROD && overrides.consentGate === undefined) {
    return { ...merged, consentGate: true }
  }
  return merged
}

export function setFlagOverrides(next: Partial<FeatureFlags>) {
  overrides = { ...overrides, ...next }
}

export function isAiEnabled(): boolean {
  return !getFlags().aiKillSwitch
}
