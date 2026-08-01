/** Client helpers for optional Razorpay Checkout (keys may be absent in pilot). */

import { getSupabase } from './supabase'
import { friendlyError } from './errors'

export function isRazorpayConfigured(): boolean {
  return Boolean((import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined)?.trim())
}

export function getRazorpayKeyId(): string {
  return ((import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) || '').trim()
}

type RazorpaySuccess = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.Razorpay) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-orbit-razorpay]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.orbitRazorpay = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Razorpay Checkout'))
    document.body.appendChild(script)
  })
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
    /* demo */
  }
  return headers
}

/** Pay specific unpaid fee invoices — server computes amount from DB. */
export async function startRazorpayCheckout(input: {
  feeItemIds: string[]
  studentId?: string | null
  payerName?: string
  description?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRazorpayConfigured()) {
    return { ok: false, error: friendlyError('Razorpay keys not configured') }
  }
  const feeItemIds = [...new Set(input.feeItemIds.filter(Boolean))]
  if (!feeItemIds.length) return { ok: false, error: 'Select at least one unpaid invoice.' }

  const headers = await authHeaders()
  if (!headers.Authorization) {
    return { ok: false, error: friendlyError('Sign in required') }
  }

  const orderRes = await fetch('/api/razorpay/order', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      feeItemIds,
      studentId: input.studentId,
      payerName: input.payerName,
      description: input.description,
    }),
  })
  const orderJson = (await orderRes.json().catch(() => ({}))) as {
    error?: string
    orderId?: string
    amount?: number
    currency?: string
    keyId?: string
  }
  if (!orderRes.ok || !orderJson.orderId) {
    return { ok: false, error: friendlyError(orderJson.error || 'Could not create Razorpay order') }
  }

  try {
    await loadCheckoutScript()
  } catch (err) {
    return { ok: false, error: friendlyError(err instanceof Error ? err.message : 'Checkout load failed') }
  }

  if (!window.Razorpay) return { ok: false, error: 'Razorpay Checkout unavailable' }

  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: orderJson.keyId || getRazorpayKeyId(),
      amount: orderJson.amount,
      currency: orderJson.currency || 'INR',
      name: 'Orbit School Fees',
      description: input.description || 'School fee payment',
      order_id: orderJson.orderId,
      prefill: { name: input.payerName || '' },
      handler: async (response: RazorpaySuccess) => {
        try {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payerName: input.payerName,
            }),
          })
          const verifyJson = (await verifyRes.json().catch(() => ({}))) as {
            error?: string
            ok?: boolean
            alreadyPaid?: boolean
          }
          if (!verifyRes.ok || !verifyJson.ok) {
            resolve({
              ok: false,
              error: friendlyError(verifyJson.error || 'Payment verification failed'),
            })
            return
          }
          resolve({ ok: true })
        } catch (err) {
          resolve({
            ok: false,
            error: friendlyError(err instanceof Error ? err.message : 'Payment verification failed'),
          })
        }
      },
      modal: {
        ondismiss: () => resolve({ ok: false, error: friendlyError('Payment cancelled') }),
      },
    })
    rzp.open()
  })
}
