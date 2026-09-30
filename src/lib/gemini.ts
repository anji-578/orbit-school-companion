import { FALLBACK_QUIZ, offlineAiAnswers } from '../data/demo'
import type { QuizPayload, SyllabusChapter } from '../types'
import {
  TUTOR_SYSTEM_BASE,
  buildSyllabusContext,
  offlineTutorAnswer,
  parseTutorAnswer,
  tutorAnswerToMarkdown,
  type TutorAnswer,
} from './aiGuardrails'
import { getSupabase } from './supabase'

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

export function isAiConfigured(): boolean {
  // AI is available via /api/gemini; offline fallbacks remain when proxy fails.
  return true
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    const supabase = getSupabase()
    if (supabase) {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) headers.Authorization = `Bearer ${token}`
    }
  } catch {
    /* offline / demo */
  }
  return headers
}

async function callViaProxy(
  prompt: string,
  system: string,
  jsonMode: boolean,
  image?: { base64: string; mimeType: string },
  temperature?: number,
): Promise<{ ok: true; text: string; model?: string } | { ok: false; error: string }> {
  try {
    const headers = await authHeaders()
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        system,
        jsonMode,
        temperature,
        ...(image
          ? {
              imageBase64: image.base64,
              mimeType: image.mimeType,
            }
          : {}),
      }),
    })
    const payload = (await response.json().catch(() => null)) as {
      text?: string
      error?: string
      model?: string
    } | null
    if (!response.ok) {
      const statusHint =
        response.status === 401
          ? 'Sign in required for Orbit AI'
          : response.status === 503
            ? 'Server auth/env not configured'
            : response.status === 500
              ? 'Server AI key missing'
              : null
      return {
        ok: false,
        error: payload?.error || statusHint || `Proxy HTTP ${response.status}`,
      }
    }
    if (!payload?.text) return { ok: false, error: 'Empty proxy response' }
    return { ok: true, text: payload.text, model: payload.model }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Proxy unavailable' }
  }
}

async function callGemini(
  prompt: string,
  system: string,
  jsonMode = false,
  image?: { base64: string; mimeType: string },
  temperature?: number,
): Promise<{ ok: true; text: string; model?: string } | { ok: false; error: string }> {
  const proxied = await callViaProxy(prompt, system, jsonMode, image, temperature)
  if (proxied.ok) return proxied
  return { ok: false, error: proxied.error || 'AI proxy unavailable' }
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

export async function askOrbitAi(prompt: string, system: string): Promise<AiTextResult> {
  const result = await callGemini(prompt, system, false)
  if (!result.ok) {
    return { text: pickOfflineAnswer(prompt), source: 'offline', error: result.error }
  }
  return { text: result.text, source: 'live' }
}

export type AiTutorResult = AiTextResult & {
  answer: TutorAnswer
  model?: string
}

/** Grounded, structured tutor reply for students (JSON schema + syllabus context). */
export async function askOrbitTutor(
  question: string,
  curriculum: SyllabusChapter[] = [],
): Promise<AiTutorResult> {
  const context = buildSyllabusContext(question, curriculum)
  const prompt = [
    context ? `${context}\n\n---` : 'SYLLABUS CONTEXT: (none matched — keep confidence low unless the topic is general school knowledge)',
    '',
    `Student question: ${question.trim()}`,
    '',
    'Return the JSON tutor schema. If the question is unsafe or out of scope, set refuse=true.',
  ].join('\n')

  if (!isAiConfigured()) {
    const answer = offlineTutorAnswer(question)
    return {
      text: tutorAnswerToMarkdown(answer),
      source: 'offline',
      error: 'API key not configured',
      answer,
    }
  }

  const result = await callGemini(prompt, TUTOR_SYSTEM_BASE, true, undefined, 0.15)
  if (!result.ok) {
    const answer = offlineTutorAnswer(question)
    return {
      text: tutorAnswerToMarkdown(answer),
      source: 'offline',
      error: result.error,
      answer,
    }
  }

  const parsed = parseTutorAnswer(result.text)
  if (!parsed) {
    const answer = offlineTutorAnswer(question)
    return {
      text: tutorAnswerToMarkdown(answer),
      source: 'offline',
      error: 'Could not parse structured tutor JSON',
      answer,
    }
  }

  // Honesty clamp: no syllabus match ⇒ cannot claim grounded high confidence
  if (!context) {
    parsed.groundedInSyllabus = false
    if (parsed.confidence === 'high') parsed.confidence = 'medium'
    if (!parsed.caveats.some((c) => /textbook|teacher|verify/i.test(c))) {
      parsed.caveats = [...parsed.caveats, 'Not matched to your class syllabus — verify with textbook/teacher.']
    }
  } else if (parsed.groundedInSyllabus && parsed.confidence === 'high') {
    // keep high only when model claims grounding and we actually had context
  }

  return {
    text: tutorAnswerToMarkdown(parsed),
    source: 'live',
    answer: parsed,
    model: result.model,
  }
}

export async function askOrbitAiVision(
  prompt: string,
  system: string,
  imageBase64: string,
  mimeType: string,
  jsonMode = false,
): Promise<AiTextResult & { model?: string }> {
  if (!isAiConfigured()) {
    return { text: '', source: 'offline', error: 'API key not configured' }
  }

  const result = await callGemini(prompt, system, jsonMode, {
    base64: imageBase64.replace(/^data:[^;]+;base64,/, ''),
    mimeType: mimeType || 'image/jpeg',
  })
  if (!result.ok) {
    return { text: '', source: 'offline', error: result.error }
  }
  return { text: result.text, source: 'live', model: result.model }
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
