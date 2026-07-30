import { FALLBACK_QUIZ, offlineAiAnswers } from '../data/demo'
import type { QuizPayload } from '../types'

/**
 * Model fallbacks for new AI Studio accounts (AQ. auth keys).
 * gemini-2.5-flash returns 404 for many new users; 2.0-flash often hits free-tier quota.
 */
const GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
] as const

function endpointFor(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
}

export interface AiTextResult {
  text: string
  source: 'live' | 'offline'
  error?: string
}

export interface AiQuizResult {
  quiz: QuizPayload
  source: 'live' | 'offline'
  error?: string
}

function getApiKey(): string {
  const env = import.meta.env as Record<string, string | undefined>
  return (env.VITE_GEMINI_API_KEY ?? '').trim()
}

export function isAiConfigured(): boolean {
  // Production uses /api/gemini proxy; local can use VITE_GEMINI_API_KEY.
  return getApiKey().length > 0 || Boolean(import.meta.env.PROD)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
): Promise<Response> {
  let lastError: unknown = null
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      if (response.status >= 400 && response.status < 500) {
        return response
      }
      lastError = new Error(`Gemini request failed with status ${response.status}`)
    } catch (err) {
      lastError = err
    }
    if (attempt < retries) {
      await delay(2 ** attempt * 500)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Gemini request failed')
}

async function callViaProxy(
  prompt: string,
  system: string,
  jsonMode: boolean,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system, jsonMode }),
    })
    const payload = (await response.json().catch(() => null)) as { text?: string; error?: string } | null
    if (!response.ok) {
      return { ok: false, error: payload?.error || `Proxy HTTP ${response.status}` }
    }
    if (!payload?.text) return { ok: false, error: 'Empty proxy response' }
    return { ok: true, text: payload.text }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Proxy unavailable' }
  }
}

async function callGemini(
  prompt: string,
  system: string,
  jsonMode = false,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  // Prefer server proxy so the API key is not required in the browser bundle.
  const proxied = await callViaProxy(prompt, system, jsonMode)
  if (proxied.ok) return proxied

  const key = getApiKey()
  if (!key) return { ok: false, error: proxied.error || 'Missing VITE_GEMINI_API_KEY' }

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: jsonMode ? 0.4 : 0.6,
      maxOutputTokens: 2048,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  }

  const errors: string[] = [proxied.error]

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetchWithRetry(
        endpointFor(model),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify(body),
        },
        1,
      )

      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const msg =
          payload && typeof payload === 'object' && 'error' in payload
            ? String((payload as { error?: { message?: string } }).error?.message ?? response.status)
            : `HTTP ${response.status}`
        errors.push(`${model}: ${msg}`)
        if (response.status === 404 || response.status === 429 || response.status === 503) continue
        return { ok: false, error: msg }
      }

      const text = extractTextFromCandidates(payload)
      if (!text) {
        errors.push(`${model}: empty response`)
        continue
      }
      return { ok: true, text }
    } catch (err) {
      errors.push(`${model}: ${err instanceof Error ? err.message : 'Network error'}`)
    }
  }

  return { ok: false, error: errors.filter(Boolean)[0] ?? 'All Gemini models failed' }
}

function pickOfflineAnswer(prompt: string): string {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('chemistry') || normalized.includes('stoichiometry') || normalized.includes('balanc')) {
    return offlineAiAnswers.chemistry ?? offlineAiAnswers.default
  }
  if (normalized.includes('algebra') || normalized.includes('equation') || normalized.includes('variable')) {
    return offlineAiAnswers.algebra ?? offlineAiAnswers.default
  }
  if (
    normalized.includes('kirchhoff') ||
    normalized.includes('kirchoff') ||
    normalized.includes('circuit') ||
    normalized.includes('current law') ||
    normalized.includes('voltage law')
  ) {
    return [
      '## Kirchhoff’s Laws (quick)',
      '',
      '- **KCL (current):** Current into a junction = current out.',
      '- **KVL (voltage):** Sum of voltages around a closed loop = 0.',
      '',
      'Use KCL for nodes, KVL for loops when solving circuit problems.',
    ].join('\n')
  }
  return offlineAiAnswers.default
}

function extractTextFromCandidates(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const candidates = (payload as { candidates?: unknown }).candidates
  if (!Array.isArray(candidates) || candidates.length === 0) return null
  const first = candidates[0] as { content?: { parts?: { text?: string }[] } }
  const parts = first?.content?.parts
  if (!Array.isArray(parts)) return null
  const text = parts.map((p) => p?.text ?? '').join('').trim()
  return text.length > 0 ? text : null
}

export async function askOrbitAi(prompt: string, system: string): Promise<AiTextResult> {
  if (!isAiConfigured()) {
    return { text: pickOfflineAnswer(prompt), source: 'offline', error: 'API key not configured' }
  }

  const result = await callGemini(prompt, system, false)
  if (!result.ok) {
    return { text: pickOfflineAnswer(prompt), source: 'offline', error: result.error }
  }
  return { text: result.text, source: 'live' }
}

function buildOfflineQuiz(topic: string): QuizPayload {
  return {
    topic: topic.trim().length > 0 ? topic : FALLBACK_QUIZ.topic,
    questions: FALLBACK_QUIZ.questions.map((q) => ({ ...q, options: [...q.options] })),
  }
}

function parseQuizPayload(raw: string, topic: string): QuizPayload | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned) as Partial<QuizPayload>
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null
    const questions = parsed.questions
      .map((q, idx) => {
        if (!q || typeof q.question !== 'string' || !Array.isArray(q.options)) return null
        const options = q.options.filter((o): o is string => typeof o === 'string')
        if (options.length < 2) return null
        const answerIndex =
          typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex < options.length
            ? q.answerIndex
            : 0
        return { id: typeof q.id === 'number' ? q.id : idx + 1, question: q.question, options, answerIndex }
      })
      .filter((q): q is QuizPayload['questions'][number] => q !== null)
    if (questions.length === 0) return null
    return { topic: typeof parsed.topic === 'string' && parsed.topic.trim() ? parsed.topic : topic, questions }
  } catch {
    return null
  }
}

export async function generateOrbitQuiz(topic: string): Promise<AiQuizResult> {
  if (!isAiConfigured()) {
    return { quiz: buildOfflineQuiz(topic), source: 'offline', error: 'API key not configured' }
  }

  const system =
    'You are Orbit AI, an assistant that creates short multiple-choice quizzes for school students. ' +
    'Always respond with ONLY strict JSON matching this TypeScript type, no markdown fences, no commentary: ' +
    '{"topic": string, "questions": {"id": number, "question": string, "options": string[], "answerIndex": number}[]}. ' +
    'Generate exactly 3 questions with 4 options each.'
  const prompt = `Create a quiz about: ${topic}`

  const result = await callGemini(prompt, system, true)
  if (!result.ok) {
    return { quiz: buildOfflineQuiz(topic), source: 'offline', error: result.error }
  }

  const quiz = parseQuizPayload(result.text, topic)
  if (!quiz) {
    return { quiz: buildOfflineQuiz(topic), source: 'offline', error: 'Could not parse quiz JSON' }
  }
  return { quiz, source: 'live' }
}
