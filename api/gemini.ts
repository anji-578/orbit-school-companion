export const config = { runtime: 'edge' }

const MODELS = [
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
] as const

function getKey() {
  return (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim()
}

type ImagePart = { mimeType: string; data: string }

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

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: typeof temperature === 'number' ? temperature : jsonMode ? 0.2 : 0.45,
        maxOutputTokens: 2048,
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
    payload?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim() || ''
  if (!text) return { ok: false as const, status: 502, error: 'Empty model response' }
  return { ok: true as const, text, model }
}

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })
  }

  const key = getKey()
  if (!key) {
    return Response.json({ error: 'GEMINI_API_KEY not configured on server' }, { status: 500, headers: cors })
  }

  let body: {
    prompt?: string
    system?: string
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
  const system = (body.system || 'You are Orbit AI, a careful school tutor. Prefer uncertainty over guessing.').trim()
  const jsonMode = Boolean(body.jsonMode)
  const imageBase64 = (body.imageBase64 || '').replace(/^data:[^;]+;base64,/, '').trim()
  const mimeType = (body.mimeType || 'image/jpeg').trim()
  const temperature = typeof body.temperature === 'number' ? body.temperature : undefined

  if (!prompt) {
    return Response.json({ error: 'prompt is required' }, { status: 400, headers: cors })
  }
  if (imageBase64 && imageBase64.length > 5_500_000) {
    return Response.json({ error: 'Image too large. Use a clearer, smaller photo.' }, { status: 413, headers: cors })
  }

  const image = imageBase64 ? { mimeType, data: imageBase64 } : undefined
  const errors: string[] = []
  for (const model of MODELS) {
    const result = await generate(model, key, prompt, system, jsonMode, image, temperature)
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
