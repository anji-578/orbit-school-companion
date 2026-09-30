import { logger } from '@/services/logger'

export type OfflineMutation = {
  id: string
  idempotencyKey: string
  kind: 'attendance' | 'homework_completion'
  payload: Record<string, unknown>
  createdAt: string
  attempts: number
}

const QUEUE_KEY = 'orbit-offline-mutations-v1'

function readQueue(): OfflineMutation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as OfflineMutation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(items: OfflineMutation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

export function enqueueMutation(
  kind: OfflineMutation['kind'],
  payload: Record<string, unknown>,
  idempotencyKey: string,
): void {
  const q = readQueue().filter((m) => m.idempotencyKey !== idempotencyKey)
  q.push({
    id: crypto.randomUUID(),
    idempotencyKey,
    kind,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  })
  writeQueue(q)
}

export function listMutations(): OfflineMutation[] {
  return readQueue()
}

type Handler = (m: OfflineMutation) => Promise<boolean>

const handlers: Partial<Record<OfflineMutation['kind'], Handler>> = {}

export function registerMutationHandler(kind: OfflineMutation['kind'], handler: Handler) {
  handlers[kind] = handler
}

/** Last-write-wins flush with bounded retries. */
export async function flushMutationQueue(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return
  const q = readQueue()
  if (q.length === 0) return
  const remaining: OfflineMutation[] = []
  for (const m of q) {
    const handler = handlers[m.kind]
    if (!handler) {
      remaining.push(m)
      continue
    }
    try {
      const ok = await handler({ ...m, attempts: m.attempts + 1 })
      if (!ok && m.attempts + 1 < 5) remaining.push({ ...m, attempts: m.attempts + 1 })
      else if (!ok) logger.warn('offline_mutation_dropped', { kind: m.kind, id: m.id })
    } catch (err) {
      logger.warn('offline_mutation_error', {
        kind: m.kind,
        message: err instanceof Error ? err.message : 'unknown',
      })
      if (m.attempts + 1 < 5) remaining.push({ ...m, attempts: m.attempts + 1 })
    }
  }
  writeQueue(remaining)
}

export function startOfflineQueuePolling(ms = 30_000): () => void {
  const id = window.setInterval(() => {
    void flushMutationQueue()
  }, ms)
  const onOnline = () => {
    void flushMutationQueue()
  }
  window.addEventListener('online', onOnline)
  return () => {
    clearInterval(id)
    window.removeEventListener('online', onOnline)
  }
}
