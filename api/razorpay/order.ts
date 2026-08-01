import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'nodejs' }

function cors(res: Response) {
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return new Response(res.body, { status: res.status, headers })
}

function json(data: unknown, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}

function getAdmin() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim()
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  if (!keyId || !keySecret) {
    return json({ error: 'Razorpay not configured on server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' }, 503)
  }

  const admin = getAdmin()
  const authHeader = req.headers.get('Authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!admin || !bearer) return json({ error: 'Unauthorized' }, 401)
  const { data: authData, error: authErr } = await admin.auth.getUser(bearer)
  if (authErr || !authData.user?.id) return json({ error: 'Unauthorized' }, 401)

  let body: { amountRupees?: number; studentId?: string; payerName?: string; description?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const amountRupees = Number(body.amountRupees)
  if (!Number.isFinite(amountRupees) || amountRupees < 1) {
    return json({ error: 'amountRupees must be at least 1' }, 400)
  }
  const amountPaise = Math.round(amountRupees * 100)

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const receipt = `orbit_${Date.now().toString(36)}`.slice(0, 40)
  const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        studentId: body.studentId || '',
        payerName: body.payerName || '',
        userId: authData.user.id,
        description: body.description || 'Orbit school fees',
      },
    }),
  })
  const rzpJson = (await rzpRes.json().catch(() => ({}))) as { id?: string; amount?: number; currency?: string; error?: { description?: string } }
  if (!rzpRes.ok || !rzpJson.id) {
    return json({ error: rzpJson.error?.description || 'Razorpay order failed' }, 502)
  }

  return json({
    orderId: rzpJson.id,
    amount: rzpJson.amount,
    currency: rzpJson.currency || 'INR',
    keyId,
  })
}
