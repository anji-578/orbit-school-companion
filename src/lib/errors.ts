/** Map raw API / Postgres errors to short parent-facing copy. */

export function friendlyError(raw: unknown, fallback = 'Something went wrong. Try again.'): string {
  const message = typeof raw === 'string' ? raw : raw instanceof Error ? raw.message : ''
  const msg = message.trim()
  if (!msg) return fallback

  const lower = msg.toLowerCase()
  if (lower.includes('jwt') || lower.includes('unauthorized') || lower.includes('sign in')) {
    return 'Session expired — sign in again.'
  }
  if (lower.includes('network') || lower.includes('fetch failed') || lower.includes('failed to fetch')) {
    return 'Network error — check connection and retry.'
  }
  if (lower.includes('razorpay not configured') || lower.includes('keys not configured')) {
    return 'Online pay is not enabled for this school yet. Use UTR instead.'
  }
  if (lower.includes('invalid payment signature')) {
    return 'Payment could not be verified. Contact school if money was deducted.'
  }
  if (lower.includes('payment cancelled')) {
    return 'Payment cancelled.'
  }
  if (lower.includes('already paid') || lower.includes('selected invoices are already paid')) {
    return 'Those invoices are already paid.'
  }
  if (lower.includes('not linked') || lower.includes('no linked student')) {
    return 'No student linked to this account. Redeem an invite from school.'
  }
  if (lower.includes('row-level security') || lower.includes('rls') || lower.includes('42501')) {
    return 'You do not have permission for that action.'
  }
  if (lower.includes('school not found') || lower.includes('no school')) {
    return 'School profile incomplete — ask admin to link your account.'
  }
  // Keep short server messages; truncate noisy stacks.
  if (msg.length > 160) return `${msg.slice(0, 157)}…`
  return msg
}
