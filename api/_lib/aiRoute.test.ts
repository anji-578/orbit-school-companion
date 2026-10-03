import { describe, expect, it } from 'vitest'
import { matchFaq, routeAiRequest } from './aiRoute'

describe('AI routing', () => {
  it('uses vision models when an image is present', () => {
    const r = routeAiRequest({ prompt: 'mark this', hasImage: true, jsonMode: false })
    expect(r.lane).toBe('vision')
    expect(r.models.length).toBeGreaterThan(0)
  })

  it('returns a cached FAQ without models', () => {
    expect(matchFaq('Explain Newtons first law')).toBeTruthy()
    const r = routeAiRequest({ prompt: 'Explain Newton’s first law', hasImage: false, jsonMode: true })
    expect(r.lane).toBe('faq')
    expect(r.models).toEqual([])
  })

  it('sends short questions to the cheap lane', () => {
    const r = routeAiRequest({ prompt: 'what is photosynthesis', hasImage: false, jsonMode: false })
    expect(r.lane).toBe('cheap')
  })
})
