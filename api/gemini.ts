import { createClient } from '@supabase/supabase-js'
import { envFirst } from './_lib/env.js'
import {
  AI_FETCH_TIMEOUT_MS,
  AI_MAX_OUTPUT_TOKENS,
  assertImagePart,
  assertPromptSize,
  checkAiRateLimit,
  modelsToTry,
} from './_lib/aiGuards.js'

export const config = { runtime: 'nodejs' }

const MODELS = [
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
] as const

/** Server-owned tutor system — client cannot override. */
const ORBIT_TUTOR_SYSTEM = `You are Orbit AI, a careful K-12 school tutor.
Prefer uncertainty over guessing. Never invent marks, fees, attendance, or school policy.
If the question is outside school subjects, say you can only help with academics.
Keep answers concise and age-appropriate.`

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function getKey() {
  // Server-only. Never fall back to VITE_ (client) key material.
  return envFirst('GEMINI_API_KEY')
}

type ImagePart = { mimeType: string; data: string }

type AuthOk = { ok: true; userId: string }
type AuthFail = { ok: false; status: number; error: string }

async function requireAuthedUser(req: Request): Promise<AuthOk | AuthFail> {
  const authHeader = req.headers.get('Authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!bearer) return { ok: false, status: 401, error: 'Sign in required for Orbit AI' }

  const url = envFirst('VITE_SUPABASE_URL', 'SUPABASE_URL')
  const anon = envFirst('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY')
  if (!url || !anon) return { ok: false, status: 503, error: 'Auth not configured' }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${bearer}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(bearer)
  if (error || !data.user?.id) return { ok: false, status: 401, error: 'Unauthorized' }
  return { ok: true, userId: data.user.id }
}

async function generate(
  model: string,
  key: string,
  prompt: string,
  system: string,
  jsonMode: boolean,
  image?: ImagePart,
  temperature?: number,
) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ]
  if (image?.data) {
    parts.unshift({
      inlineData: {
        mimeType: image.mimeType || 'image/jpeg',
        data: image.data,
      },
    })
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      signal: AbortSignal.timeout(AI_FETCH_TIMEOUT_MS),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: typeof temperature === 'number' ? Math.min(temperature, 0.7) : jsonMode ? 0.2 : 0.45,
          maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    })

    const payload = (await response.json().catch(() => null)) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
      error?: { message?: string }
    } | null

    if (!response.ok) {
      return {
        ok: false as const,
        status: response.status,
        error: payload?.error?.message || `HTTP ${response.status}`,
      }
    }

    const text =
      payload?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim() || ''
    if (!text) return { ok: false as const, status: 502, error: 'Empty model response' }
    return { ok: true as const, text, model }
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
    return {
      ok: false as const,
      status: timedOut ? 504 : 502,
      error: timedOut ? 'AI request timed out' : err instanceof Error ? err.message : 'AI request failed',
    }
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })
  }

  const authed = await requireAuthedUser(req)
  if (authed.ok === false) {
    return Response.json({ error: authed.error }, { status: authed.status, headers: cors })
  }

  const limited = checkAiRateLimit(authed.userId)
  if (!limited.ok) {
    return Response.json(
      { error: 'Too many AI requests. Try again shortly.' },
      { status: 429, headers: { ...cors, 'Retry-After': String(limited.retryAfterSec) } },
    )
  }

  const key = getKey()
  if (!key) {
    return Response.json({ error: 'GEMINI_API_KEY not configured on server' }, { status: 500, headers: cors })
  }

  let body: {
    prompt?: string
    jsonMode?: boolean
    imageBase64?: string
    mimeType?: string
    temperature?: number
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: cors })
  }

  const prompt = (body.prompt || '').trim()
  const promptErr = assertPromptSize(prompt)
  if (promptErr) {
    const status = promptErr === 'prompt is required' ? 400 : 413
    return Response.json({ error: promptErr }, { status, headers: cors })
  }

  const jsonMode = Boolean(body.jsonMode)
  const imageBase64 = (body.imageBase64 || '').replace(/^data:[^;]+;base64,/, '').trim()
  const mimeType = (body.mimeType || 'image/jpeg').trim()
  const temperature = typeof body.temperature === 'number' ? body.temperature : undefined

  const imageErr = assertImagePart(imageBase64, mimeType)
  if (imageErr) {
    return Response.json({ error: imageErr }, { status: 413, headers: cors })
  }

  const image = imageBase64 ? { mimeType, data: imageBase64 } : undefined
  const errors: string[] = []
  for (const model of modelsToTry(MODELS)) {
    const result = await generate(model, key, prompt, ORBIT_TUTOR_SYSTEM, jsonMode, image, temperature)
    if (result.ok) {
      return Response.json({ text: result.text, model: result.model, source: 'live' }, { headers: cors })
    }
    errors.push(`${model}: ${result.error}`)
    if (result.status !== 404 && result.status !== 429 && result.status !== 503) {
      return Response.json({ error: result.error }, { status: result.status, headers: cors })
    }
  }

  return Response.json({ error: errors[0] || 'All Gemini models failed' }, { status: 502, headers: cors })
}
