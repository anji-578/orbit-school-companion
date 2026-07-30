import { FALLBACK_QUIZ, offlineAiAnswers } from '../data/demo'
import type { QuizPayload } from '../types'

const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export interface AiTextResult {
  text: string
  source: 'live' | 'offline'
}

export interface AiQuizResult {
  quiz: QuizPayload
  source: 'live' | 'offline'
}

function getApiKey(): string {
  const env = import.meta.env as Record<string, string | undefined>
  return env.VITE_GEMINI_API_KEY ?? ''
}

export function isAiConfigured(): boolean {
  return getApiKey().trim().length > 0
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

function pickOfflineAnswer(prompt: string): string {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('chemistry') || normalized.includes('stoichiometry') || normalized.includes('balanc')) {
    return offlineAiAnswers.chemistry ?? offlineAiAnswers.default
  }
  if (normalized.includes('algebra') || normalized.includes('equation') || normalized.includes('variable')) {
    return offlineAiAnswers.algebra ?? offlineAiAnswers.default
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
    return { text: pickOfflineAnswer(prompt), source: 'offline' }
  }

  try {
    const response = await fetchWithRetry(
      `${GEMINI_ENDPOINT}?key=${encodeURIComponent(getApiKey())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { role: 'system', parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
        }),
      },
      2,
    )

    if (!response.ok) {
      return { text: pickOfflineAnswer(prompt), source: 'offline' }
    }

    const payload: unknown = await response.json()
    const text = extractTextFromCandidates(payload)
    if (!text) {
      return { text: pickOfflineAnswer(prompt), source: 'offline' }
    }
    return { text, source: 'live' }
  } catch {
    return { text: pickOfflineAnswer(prompt), source: 'offline' }
  }
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
        const answerIndex = typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex < options.length
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
    return { quiz: buildOfflineQuiz(topic), source: 'offline' }
  }

  try {
    const system =
      'You are Orbit AI, an assistant that creates short multiple-choice quizzes for school students. ' +
      'Always respond with ONLY strict JSON matching this TypeScript type, no markdown fences, no commentary: ' +
      '{"topic": string, "questions": {"id": number, "question": string, "options": string[], "answerIndex": number}[]}. ' +
      'Generate exactly 3 questions with 4 options each.'
    const prompt = `Create a quiz about: ${topic}`

    const response = await fetchWithRetry(
      `${GEMINI_ENDPOINT}?key=${encodeURIComponent(getApiKey())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { role: 'system', parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1024, responseMimeType: 'application/json' },
        }),
      },
      2,
    )

    if (!response.ok) {
      return { quiz: buildOfflineQuiz(topic), source: 'offline' }
    }

    const payload: unknown = await response.json()
    const text = extractTextFromCandidates(payload)
    const quiz = text ? parseQuizPayload(text, topic) : null
    if (!quiz) {
      return { quiz: buildOfflineQuiz(topic), source: 'offline' }
    }
    return { quiz, source: 'live' }
  } catch {
    return { quiz: buildOfflineQuiz(topic), source: 'offline' }
  }
}
