import { describe, expect, it, beforeEach } from 'vitest'
import {
  AI_RATE_MAX,
  assertImagePart,
  assertPromptSize,
  checkAiRateLimit,
  demoEnsureDecision,
  isPublicSignupRole,
  modelsToTry,
  resetAiRateLimitForTests,
} from './aiGuards'

describe('AI proxy guards', () => {
  beforeEach(() => resetAiRateLimitForTests())

  it('rejects empty and oversized prompts', () => {
    expect(assertPromptSize('')).toBeTruthy()
    expect(assertPromptSize('  hi  ')).toBeNull()
    expect(assertPromptSize('x'.repeat(12_001))).toBeTruthy()
  })

  it('allows only safe image MIME types', () => {
    expect(assertImagePart('abc', 'image/jpeg')).toBeNull()
    expect(assertImagePart('abc', 'application/pdf')).toBeTruthy()
    expect(assertImagePart('x'.repeat(5_500_001), 'image/png')).toBeTruthy()
  })

  it('rate-limits a user after 20 calls in the window', () => {
    for (let i = 0; i < AI_RATE_MAX; i += 1) {
      expect(checkAiRateLimit('user-a').ok).toBe(true)
    }
    expect(checkAiRateLimit('user-a').ok).toBe(false)
    expect(checkAiRateLimit('user-b').ok).toBe(true)
  })

  it('caps model fallbacks', () => {
    expect(modelsToTry(['a', 'b', 'c', 'd'])).toEqual(['a', 'b'])
  })

  it('blocks public teacher/school self-signup roles', () => {
    expect(isPublicSignupRole('student')).toBe(true)
    expect(isPublicSignupRole('teacher')).toBe(false)
    expect(isPublicSignupRole('school')).toBe(false)
  })

  it('refuses demo ensure on Vercel production', () => {
    expect(demoEnsureDecision('production', '1')).toBe(false)
    expect(demoEnsureDecision('preview', '1')).toBe(true)
    expect(demoEnsureDecision('', '')).toBe(false)
  })
})
