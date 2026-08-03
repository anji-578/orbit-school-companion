import { env } from '../_lib/env.js'
import { getAdmin, loadProfile, requireUser } from '../_lib/supabaseAdmin.js'
import { verifyRazorpayCheckoutSignature } from '../_lib/razorpayCrypto.js'

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

  const keySecret = env('RAZORPAY_KEY_SECRET')
  if (!keySecret) return json({ error: 'Razorpay not configured' }, 503)

  const admin = getAdmin()
  if (!admin) return json({ error: 'Server misconfigured' }, 503)
  const auth = await requireUser(req, admin)
  if ('error' in auth) return json({ error: auth.error }, auth.status)

  let body: {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    payerName?: string
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

  if (
    !verifyRazorpayCheckoutSignature({
      orderId,
      paymentId,
      signature,
      keySecret,
    })
  ) {
    return json({ error: 'Invalid payment signature' }, 400)
  }

  const profile = await loadProfile(admin, auth.user.id)
  if (!profile?.school_id) return json({ error: 'No school on profile' }, 400)

  const { data: order, error: orderErr } = await admin
    .from('payment_orders')
    .select('id, school_id, created_by, student_id, fee_item_ids, amount_paise, status')
    .eq('razorpay_order_id', orderId)
    .maybeSingle()

  if (orderErr) return json({ error: orderErr.message }, 500)
  if (!order) return json({ error: 'Unknown order' }, 404)
  if (order.school_id !== profile.school_id) return json({ error: 'Order school mismatch' }, 403)
  if (order.created_by !== auth.user.id && profile.role !== 'school') {
    return json({ error: 'Not your order' }, 403)
  }
  if (order.status === 'paid') {
    return json({ ok: true, paymentId, alreadyPaid: true, feeItemIds: order.fee_item_ids || [] })
  }

  const feeIds = [...new Set(((order.fee_item_ids as string[]) || []).filter(Boolean))]
  if (!feeIds.length) return json({ error: 'Order has no invoices' }, 400)

  // Confirm invoices still belong to this school and match order amount.
  const { data: fees, error: feeReadErr } = await admin
    .from('fee_items')
    .select('id, amount_paise, status, school_id, student_id')
    .eq('school_id', order.school_id)
    .in('id', feeIds)

  if (feeReadErr) return json({ error: feeReadErr.message }, 500)
  if (!fees?.length || fees.length !== feeIds.length) {
    return json({ error: 'Order invoices missing or out of school scope' }, 400)
  }

  type FeeRow = {
    id: string
    amount_paise: number | null
    status: string
    school_id: string
    student_id: string
  }
  const feeRows = (fees ?? []) as FeeRow[]

  const unpaid = feeRows.filter((f) => f.status !== 'Paid')
  const unpaidPaise = unpaid.reduce((sum, f) => sum + Number(f.amount_paise || 0), 0)
  // If some already paid (partial retry), remaining unpaid must not exceed order amount.
  if (unpaid.length && unpaidPaise > Number(order.amount_paise)) {
    return json({ error: 'Order amount mismatch with invoices' }, 400)
  }

  const { data: existing } = await admin
    .from('payment_submissions')
    .select('id')
    .eq('razorpay_payment_id', paymentId)
    .maybeSingle()

  if (!existing) {
    const { error: insertErr } = await admin.from('payment_submissions').insert({
      school_id: order.school_id,
      submitted_by: auth.user.id,
      student_id: order.student_id,
      payer_name: body.payerName || profile.display_name || null,
      amount_paise: order.amount_paise,
      utr: `RZP-${paymentId}`,
      paid_on: new Date().toISOString().slice(0, 10),
      note: 'Paid via Razorpay Checkout',
      status: 'Verified',
      provider: 'razorpay',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    })
    if (insertErr) {
      // Unique race: another verify won — continue to mark fees/order paid.
      const code = 'code' in insertErr ? String(insertErr.code) : ''
      const dup =
        code === '23505' ||
        insertErr.message.toLowerCase().includes('duplicate') ||
        insertErr.message.toLowerCase().includes('unique')
      if (!dup) return json({ error: insertErr.message }, 500)
    }
  }

  if (unpaid.length) {
    const unpaidIds = unpaid.map((f) => f.id)
    const { error: feeUpdateErr } = await admin
      .from('fee_items')
      .update({ status: 'Paid' })
      .eq('school_id', order.school_id)
      .in('id', unpaidIds)
      .neq('status', 'Paid')

    if (feeUpdateErr) return json({ error: feeUpdateErr.message }, 500)
  }

  const { error: orderPaidErr } = await admin
    .from('payment_orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', order.id)
    .eq('status', 'created')

  if (orderPaidErr) return json({ error: orderPaidErr.message }, 500)

  // Best-effort audit (service role bypasses RLS)
  await admin.from('audit_log').insert({
    school_id: order.school_id,
    actor_id: auth.user.id,
    action: 'fee.razorpay_verify',
    entity_type: 'payment_orders',
    entity_id: order.id,
    payload: {
      paymentId,
      orderId,
      feeItemIds: feeIds,
      amountPaise: order.amount_paise,
      studentId: order.student_id,
    },
  })

  return json({
    ok: true,
    paymentId,
    feeItemIds: feeIds,
    amountPaise: order.amount_paise,
    studentId: order.student_id,
    alreadyPaid: false,
  })
}
