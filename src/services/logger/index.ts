type Level = 'debug' | 'info' | 'warn' | 'error'

function emit(level: Level, event: string, props?: Record<string, unknown>) {
  if (import.meta.env.PROD && level === 'debug') return
  const payload = { level, event, ...props, ts: new Date().toISOString() }
  if (level === 'error') console.error('[orbit]', payload)
  else if (level === 'warn') console.warn('[orbit]', payload)
  else console.info('[orbit]', payload)
}

export const logger = {
  debug: (event: string, props?: Record<string, unknown>) => emit('debug', event, props),
  info: (event: string, props?: Record<string, unknown>) => emit('info', event, props),
  warn: (event: string, props?: Record<string, unknown>) => emit('warn', event, props),
  error: (event: string, props?: Record<string, unknown>) => emit('error', event, props),
}
