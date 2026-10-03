import { env, envFirst } from './env.js'

const LOCAL_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://10.0.2.2:5173',
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
]

/** Browser, Vercel preview, and Capacitor WebView origins allowed to call /api. */
export function allowedOrbitOrigins(): string[] {
  const extra = env('ORBIT_WEB_ORIGINS')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const vercel = envFirst('VERCEL_PROJECT_PRODUCTION_URL', 'VERCEL_URL')
  const vercelOrigin = vercel ? (vercel.startsWith('http') ? vercel : `https://${vercel}`) : ''
  return [...new Set([...LOCAL_ORIGINS, ...extra, vercelOrigin].filter(Boolean))]
}

export function corsHeaders(req: Request, methods = 'POST, OPTIONS'): Record<string, string> {
  const origin = req.headers.get('Origin') || ''
  const allowed = allowedOrbitOrigins()
  const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || 'https://localhost'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-orbit-notify-secret, x-orbit-request-id',
    Vary: 'Origin',
  }
}
