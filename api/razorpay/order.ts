import { getAdmin, loadProfile, requireUser } from '../_lib/supabaseAdmin'

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

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '').trim()
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim()
  if (!keyId || !keySecret) {
    return json({ error: 'Razorpay not configured on server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).' }, 503)
  }

  const admin = getAdmin()
  if (!admin) return json({ error: 'Server misconfigured' }, 503)
  const auth = await requireUser(req, admin)
  if ('error' in auth) return json({ error: auth.error }, auth.status)

  let body: { feeItemIds?: string[]; studentId?: string; payerName?: string }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const feeItemIds = [...new Set((body.feeItemIds || []).map((id) => String(id).trim()).filter(Boolean))]
  if (!feeItemIds.length) return json({ error: 'feeItemIds required' }, 400)

  const profile = await loadProfile(admin, auth.user.id)
  if (!profile?.school_id) return json({ error: 'No school on profile' }, 400)
  const schoolId = profile.school_id

  const { data: fees, error: feeErr } = await admin
    .from('fee_items')
    .select('id, student_id, amount_paise, status, school_id')
    .eq('school_id', schoolId)
    .in('id', feeItemIds)

  if (feeErr) return json({ error: feeErr.message }, 500)
  if (!fees?.length || fees.length !== feeItemIds.length) {
    return json({ error: 'One or more invoices not found for this school' }, 400)
  }

  const unpaid = fees.filter((f) => f.status !== 'Paid')
  if (!unpaid.length) return json({ error: 'Selected invoices are already paid' }, 400)

  const studentIds = [...new Set(unpaid.map((f) => f.student_id as string).filter(Boolean))]
  if (studentIds.length !== 1) {
    return json({ error: 'Pay invoices for one student at a time' }, 400)
  }
  const studentId = studentIds[0]!
  if (body.studentId && body.studentId !== studentId) {
    return json({ error: 'studentId does not match invoices' }, 400)
  }

  // Parent/student may only pay for linked child; school may create on behalf.
  if (profile.role === 'parent') {
    const { data: link } = await admin
      .from('parent_links')
      .select('student_id')
      .eq('parent_profile_id', auth.user.id)
      .eq('student_id', studentId)
      .maybeSingle()
    if (!link) return json({ error: 'Not linked to this student' }, 403)
  } else if (profile.role === 'student') {
    const { data: stu } = await admin
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('profile_id', auth.user.id)
      .maybeSingle()
    if (!stu) return json({ error: 'Not your student record' }, 403)
  } else if (profile.role !== 'school') {
    return json({ error: 'Only parent, student, or school can create fee orders' }, 403)
  }

  const amountPaise = unpaid.reduce((sum, f) => sum + Number(f.amount_paise || 0), 0)
  if (amountPaise < 100) return json({ error: 'Amount too small' }, 400)

  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const receipt = `orbit_${Date.now().toString(36)}`.slice(0, 40)
  const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authHeader}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        schoolId,
        studentId,
        userId: auth.user.id,
        feeItemIds: unpaid.map((f) => f.id).join(','),
      },
    }),
  })
  const rzpJson = (await rzpRes.json().catch(() => ({}))) as {
    id?: string
    amount?: number
    currency?: string
    error?: { description?: string }
  }
  if (!rzpRes.ok || !rzpJson.id) {
    return json({ error: rzpJson.error?.description || 'Razorpay order failed' }, 502)
  }

  const { error: orderInsertErr } = await admin.from('payment_orders').insert({
    school_id: schoolId,
    created_by: auth.user.id,
    student_id: studentId,
    fee_item_ids: unpaid.map((f) => f.id),
    amount_paise: amountPaise,
    razorpay_order_id: rzpJson.id,
    status: 'created',
  })
  if (orderInsertErr) return json({ error: orderInsertErr.message }, 500)

  return json({
    orderId: rzpJson.id,
    amount: amountPaise,
    currency: rzpJson.currency || 'INR',
    keyId,
    studentId,
    feeItemIds: unpaid.map((f) => f.id),
  })
}
