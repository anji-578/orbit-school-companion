import crypto from 'node:crypto'

/** Razorpay checkout signature: HMAC-SHA256(orderId|paymentId). */
export function razorpayCheckoutSignature(
  orderId: string,
  paymentId: string,
  keySecret: string,
): string {
  return crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
}

/** Constant-time compare for hex digests (rejects length mismatch). */
export function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, 'utf8')
    const right = Buffer.from(b, 'utf8')
    if (left.length !== right.length) return false
    return crypto.timingSafeEqual(left, right)
  } catch {
    return false
  }
}

export function verifyRazorpayCheckoutSignature(input: {
  orderId: string
  paymentId: string
  signature: string
  keySecret: string
}): boolean {
  const expected = razorpayCheckoutSignature(input.orderId, input.paymentId, input.keySecret)
  return safeEqualHex(expected, input.signature)
}
