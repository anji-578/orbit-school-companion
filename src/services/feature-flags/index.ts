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
  return { ...defaults, ...overrides }
}

export function setFlagOverrides(next: Partial<FeatureFlags>) {
  overrides = { ...overrides, ...next }
}

export function isAiEnabled(): boolean {
  return !getFlags().aiKillSwitch
}
