const CHEAP_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'] as const
const STRONG_MODELS = ['gemini-flash-latest', 'gemini-3.6-flash'] as const
const VISION_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'] as const

export type AiLane = 'faq' | 'cheap' | 'strong' | 'vision'

const FAQ: Array<{ test: RegExp; text: string }> = [
  {
    test: /\b(newton'?s?\s+first\s+law|law of inertia)\b/i,
    text: JSON.stringify({
      title: 'Newton’s first law',
      explanation: [
        'An object stays at rest or keeps moving in a straight line unless a net force acts on it.',
        'This is also called the law of inertia.',
      ],
      example: 'A book on a table stays put until you push it.',
      formula: '',
      checkYourself: 'What happens to a rolling ball if friction is zero?',
      confidence: 'medium',
      groundedInSyllabus: false,
      caveats: ['Verify with your textbook wording.'],
      refuse: false,
      refuseReason: '',
    }),
  },
]

export function matchFaq(prompt: string): string | null {
  const normalized = prompt.replace(/['’]/g, "'")
  const hit = FAQ.find((f) => f.test.test(normalized))
  return hit?.text ?? null
}

export function routeAiRequest(input: { prompt: string; hasImage: boolean; jsonMode: boolean }): {
  lane: AiLane
  models: readonly string[]
  feature: string
} {
  if (input.hasImage) {
    return { lane: 'vision', models: VISION_MODELS, feature: 'vision' }
  }
  if (matchFaq(input.prompt)) {
    return { lane: 'faq', models: [], feature: 'faq' }
  }
  const long = input.prompt.length > 900 || input.jsonMode
  if (long) return { lane: 'strong', models: STRONG_MODELS, feature: 'tutor' }
  return { lane: 'cheap', models: CHEAP_MODELS, feature: 'tutor' }
}
