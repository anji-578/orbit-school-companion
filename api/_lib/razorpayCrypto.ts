/** Razorpay checkout signature: HMAC-SHA256(orderId|paymentId). Uses Web Crypto (no Node types). */

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function razorpayCheckoutSignature(
  orderId: string,
  paymentId: string,
  keySecret: string,
): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${orderId}|${paymentId}`))
  return bytesToHex(sig)
}

/** Constant-time compare for hex digests (rejects length mismatch). */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function verifyRazorpayCheckoutSignature(input: {
  orderId: string
  paymentId: string
  signature: string
  keySecret: string
}): Promise<boolean> {
  const expected = await razorpayCheckoutSignature(input.orderId, input.paymentId, input.keySecret)
  return safeEqualHex(expected, input.signature)
}
