export function isDemoAccount(_email: string | null | undefined): boolean {
  // Email-domain heuristics removed. Demo branding comes from schools.is_demo (server).
  return false
}

export function isDemoSchool(school?: { isDemo?: boolean; is_demo?: boolean } | null): boolean {
  return Boolean(school?.isDemo || school?.is_demo)
}
