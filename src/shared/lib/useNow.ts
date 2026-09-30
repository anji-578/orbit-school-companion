import { useEffect, useState } from 'react'

/**
 * Minute-granularity "now" for class countdowns. Pauses when the document is hidden.
 * Replaces the 900ms tickBus interval on the student shell.
 */
export function useNow(granularityMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null

    const tick = () => setNow(new Date())

    const start = () => {
      if (id != null) return
      tick()
      id = setInterval(tick, granularityMs)
    }
    const stop = () => {
      if (id != null) {
        clearInterval(id)
        id = null
      }
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [granularityMs])

  return now
}
