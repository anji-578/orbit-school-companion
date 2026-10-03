/** Shared AI request guards for the Gemini proxy (Node). */

export const AI_PROMPT_MAX_CHARS = 12_000
export const AI_IMAGE_MAX_B64_CHARS = 5_500_000
export const AI_MAX_OUTPUT_TOKENS = 2048
export const AI_RATE_WINDOW_MS = 10 * 60 * 1000
export const AI_RATE_MAX = 20
export const AI_FETCH_TIMEOUT_MS = 25_000
export const AI_MODEL_FALLBACK_MAX = 2

export const AI_ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const hits = new Map<string, number[]>()

export function pruneRateWindow(now: number, stamps: number[]): number[] {
  return stamps.filter((t) => now - t < AI_RATE_WINDOW_MS)
}

export function checkAiRateLimit(
  userId: string,
  now = Date.now(),
): { ok: true } | { ok: false; retryAfterSec: number } {
  const next = pruneRateWindow(now, hits.get(userId) ?? [])
  if (next.length >= AI_RATE_MAX) {
    const oldest = next[0] ?? now
    const retryAfterSec = Math.max(1, Math.ceil((AI_RATE_WINDOW_MS - (now - oldest)) / 1000))
    hits.set(userId, next)
    return { ok: false, retryAfterSec }
  }
  next.push(now)
  hits.set(userId, next)
  return { ok: true }
}

/** Test-only. */
export function resetAiRateLimitForTests(): void {
  hits.clear()
}

export function assertPromptSize(prompt: string): string | null {
  const trimmed = prompt.trim()
  if (!trimmed) return 'prompt is required'
  if (trimmed.length > AI_PROMPT_MAX_CHARS) return 'Prompt too long'
  return null
}

export function assertImagePart(imageBase64: string, mimeType: string): string | null {
  if (!imageBase64) return null
  if (imageBase64.length > AI_IMAGE_MAX_B64_CHARS) return 'Image too large. Use a clearer, smaller photo.'
  const mime = mimeType.trim().toLowerCase()
  if (!AI_ALLOWED_IMAGE_MIME.has(mime)) return 'Unsupported image type'
  return null
}

export function modelsToTry<T>(models: readonly T[]): T[] {
  return models.slice(0, AI_MODEL_FALLBACK_MAX)
}

export function publicSignupRoles(): readonly string[] {
  return ['student', 'parent']
}

export function demoEnsureDecision(vercelEnv: string, allowFlag: string): boolean {
  if (vercelEnv === 'production') return false
  return allowFlag === '1'
}

export function isPublicSignupRole(role: string): boolean {
  return publicSignupRoles().includes(role)
}
