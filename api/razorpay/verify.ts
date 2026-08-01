import crypto from 'node:crypto'
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

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  if (!keySecret) return json({ error: 'Razorpay not configured' }, 503)

  const admin = getAdmin()
  const authHeader = req.headers.get('Authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!admin || !bearer) return json({ error: 'Unauthorized' }, 401)
  const { data: authData, error: authErr } = await admin.auth.getUser(bearer)
  if (authErr || !authData.user?.id) return json({ error: 'Unauthorized' }, 401)

  let body: {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    studentId?: string
    payerName?: string
    amountRupees?: number
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const orderId = (body.razorpay_order_id || '').trim()
  const paymentId = (body.razorpay_payment_id || '').trim()
  const signature = (body.razorpay_signature || '').trim()
  if (!orderId || !paymentId || !signature) return json({ error: 'Missing payment fields' }, 400)

  const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
  if (expected !== signature) return json({ error: 'Invalid payment signature' }, 400)

  const { data: profile } = await admin
    .from('profiles')
    .select('school_id')
    .eq('id', authData.user.id)
    .maybeSingle()
  const schoolId = (profile?.school_id as string | undefined) || null
  if (!schoolId) return json({ error: 'No school on profile' }, 400)

  const amountPaise = Math.round(Number(body.amountRupees || 0) * 100)
  if (amountPaise < 100) return json({ error: 'Invalid amount' }, 400)

  const studentId = body.studentId?.trim() || null

  const { error: insertErr } = await admin.from('payment_submissions').insert({
    school_id: schoolId,
    submitted_by: authData.user.id,
    student_id: studentId,
    payer_name: body.payerName || null,
    amount_paise: amountPaise,
    utr: `RZP-${paymentId}`,
    paid_on: new Date().toISOString().slice(0, 10),
    note: 'Paid via Razorpay Checkout',
    status: 'Verified',
    provider: 'razorpay',
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
  })
  if (insertErr) return json({ error: insertErr.message }, 500)

  if (studentId) {
    await admin
      .from('fee_items')
      .update({ status: 'Paid' })
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .neq('status', 'Paid')
  }

  return json({ ok: true, paymentId })
}
