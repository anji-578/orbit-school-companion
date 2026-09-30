import { describe, expect, it } from 'vitest'
import { resolveOrbitDeepLink } from './deep-link'

describe('resolveOrbitDeepLink', () => {
  it('parses orbit subject links', () => {
    const r = resolveOrbitDeepLink('orbit://subject?subject=Math')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.dest).toBe('subject')
      expect(r.params.subject).toBe('Math')
    }
  })

  it('rejects unknown destinations', () => {
    const r = resolveOrbitDeepLink('orbit://not-a-real-place')
    expect(r.ok).toBe(false)
  })

  it('parses /d/ path form', () => {
    const r = resolveOrbitDeepLink('/d/homework?taskId=12')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.dest).toBe('homework')
      expect(r.params.taskId).toBe('12')
    }
  })
})
