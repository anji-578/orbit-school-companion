/**
 * Lightweight smoke checks for path-to-9 hardening helpers (no Vitest required).
 * Run: node scripts/smoke-hardening.mjs
 */
import crypto from 'node:crypto'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function isPilotDemoEmail(email) {
  const normalized = email.trim().toLowerCase()
  if (normalized.endsWith('@pilot100.orbit.app')) return false
  const DEMO = ['student@orbit.app', 'parent@orbit.app', 'teacher@orbit.app', 'admin@orbit.app']
  return DEMO.includes(normalized)
}

function parseRosterCsv(text) {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return { rows: [], error: 'CSV needs a header row and at least one student.' }
  const header = lines[0].toLowerCase().replace(/\s+/g, '_').split(',')
  const nameIdx = header.findIndex((h) => ['display_name', 'name', 'student_name'].includes(h))
  const sectionIdx = header.findIndex((h) => ['section', 'sec'].includes(h))
  if (nameIdx < 0) return { rows: [], error: 'Missing display_name' }
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const displayName = (cols[nameIdx] || '').trim()
    if (!displayName) continue
    rows.push({
      displayName,
      section: sectionIdx >= 0 ? (cols[sectionIdx] || '').trim() : '',
    })
  }
  return { rows }
}

function friendlyError(raw, fallback = 'Something went wrong. Try again.') {
  const message = typeof raw === 'string' ? raw : raw instanceof Error ? raw.message : ''
  const msg = message.trim()
  if (!msg) return fallback
  const lower = msg.toLowerCase()
  if (lower.includes('unauthorized') || lower.includes('sign in')) return 'Session expired — sign in again.'
  if (lower.includes('razorpay not configured') || lower.includes('keys not configured')) {
    return 'Online pay is not enabled for this school yet. Use UTR instead.'
  }
  if (lower.includes('invalid payment signature')) {
    return 'Payment could not be verified. Contact school if money was deducted.'
  }
  if (lower.includes('payment cancelled')) return 'Payment cancelled.'
  return msg.length > 160 ? `${msg.slice(0, 157)}…` : msg
}

function razorpayCheckoutSignature(orderId, paymentId, keySecret) {
  return crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
}

function safeEqualHex(a, b) {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return crypto.timingSafeEqual(left, right)
}

assert(isPilotDemoEmail('student@orbit.app') === true, 'demo student')
assert(isPilotDemoEmail('admin@orbit.app') === true, 'demo admin')
assert(isPilotDemoEmail('teacher01@pilot100.orbit.app') === false, 'pilot not demo')
assert(isPilotDemoEmail('parent001@pilot100.orbit.app') === false, 'pilot parent not demo')
assert(isPilotDemoEmail('random@orbit.app') === false, 'random orbit.app not demo')

const blankSection = parseRosterCsv('display_name,class_name,section,roll_no\nRiya,Grade 10,,1')
assert(!blankSection.error, 'csv parses')
assert(blankSection.rows[0].section === '', 'blank section stays empty (not A)')

assert(friendlyError('Unauthorized').includes('Session expired'), 'auth error copy')
assert(friendlyError('Razorpay keys not configured').includes('UTR instead'), 'razorpay config copy')
assert(friendlyError('Invalid payment signature').includes('could not be verified'), 'signature copy')
assert(friendlyError('Payment cancelled') === 'Payment cancelled.', 'cancel copy')

const secret = 'test_secret_key'
const orderId = 'order_ABC'
const paymentId = 'pay_XYZ'
const good = razorpayCheckoutSignature(orderId, paymentId, secret)
assert(safeEqualHex(good, good), 'sig matches self')
assert(!safeEqualHex(good, razorpayCheckoutSignature(orderId, 'pay_OTHER', secret)), 'sig rejects wrong payment')
assert(!safeEqualHex(good, '0'.repeat(good.length)), 'sig rejects zeros')

console.log('smoke-hardening: ok')
