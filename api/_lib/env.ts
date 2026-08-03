/** Typed env access for Vercel Node/Edge functions (avoids bare `process` without @types/node). */
export function env(name: string): string {
  const value = process.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

export function envFirst(...names: string[]): string {
  for (const name of names) {
    const value = env(name)
    if (value) return value
  }
  return ''
}
