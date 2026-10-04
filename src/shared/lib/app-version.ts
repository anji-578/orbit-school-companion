/** Display version — never show a dummy 0.0.0 in production builds. */
export function orbitAppVersion(): string {
  const pkg = (typeof __ORBIT_PKG_VERSION__ !== 'undefined' ? __ORBIT_PKG_VERSION__ : '0.0.0').trim()
  const sha = (typeof __ORBIT_BUILD__ !== 'undefined' ? __ORBIT_BUILD__ : '').trim()
  if (pkg && pkg !== '0.0.0') return pkg
  if (sha) return sha
  if (import.meta.env.DEV) return 'dev'
  return '1.0'
}

declare const __ORBIT_PKG_VERSION__: string
declare const __ORBIT_BUILD__: string
