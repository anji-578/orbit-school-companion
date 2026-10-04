export type ThemePreference = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light'
  return preference
}
