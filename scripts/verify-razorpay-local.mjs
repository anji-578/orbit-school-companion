/**
 * Offline Razorpay verify contract check (no live keys required).
 * Optional: with RAZORPAY_KEY_SECRET + SUPABASE_SERVICE_ROLE_KEY, prints config readiness.
 *
 * Run: node scripts/verify-razorpay-local.mjs
 */
import crypto from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile() {
  const path = resolve(process.cwd(), '.env')
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
  return out
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function signature(orderId, paymentId, secret) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
}

function safeEqual(a, b) {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

const secret = 'orbit_test_secret'
const orderId = 'order_test_001'
const paymentId = 'pay_test_001'
const good = signature(orderId, paymentId, secret)
assert(safeEqual(good, good), 'accept valid signature')
assert(!safeEqual(good, signature(orderId, 'pay_other', secret)), 'reject wrong payment id')
assert(!safeEqual(good, signature('order_other', paymentId, secret)), 'reject wrong order id')

const env = { ...loadEnvFile(), ...process.env }
const ready = {
  viteRazorpayKey: Boolean(env.VITE_RAZORPAY_KEY_ID),
  razorpayKeyId: Boolean(env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID),
  razorpaySecret: Boolean(env.RAZORPAY_KEY_SECRET),
  serviceRole: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
  supabaseUrl: Boolean(env.VITE_SUPABASE_URL || env.SUPABASE_URL),
}

console.log('verify-razorpay-local: crypto contract ok')
console.log('config readiness:', ready)
if (!ready.serviceRole || !ready.razorpaySecret || !ready.razorpayKeyId) {
  console.log(
    'Note: set SUPABASE_SERVICE_ROLE_KEY + RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET (+ VITE_RAZORPAY_KEY_ID) on Vercel for live Checkout.',
  )
} else {
  console.log('Local env has Razorpay + service role — production APIs can verify payments after deploy.')
}
