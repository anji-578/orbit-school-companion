import { describe, expect, it } from 'vitest'
import { resolveTheme } from './resolve-theme'

describe('resolveTheme', () => {
  it('uses explicit light/dark', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('follows system preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})
