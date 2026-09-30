/** Demo account detection — keep branding/seed paths behind this flag. */
export function isDemoAccount(email: string | null | undefined): boolean {
  if (!email) return false
  return email.toLowerCase().includes('@demo50.orbit.app')
}
