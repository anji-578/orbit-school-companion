import { upsertAttendanceMark } from './attendanceApi'

const QUEUE_KEY = 'orbit_attendance_queue_v1'

export type QueuedAttendanceMark = {
  studentId: string
  present: boolean
  reason?: string
  queuedAt: number
}

function readQueue(): QueuedAttendanceMark[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as QueuedAttendanceMark[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(items: QueuedAttendanceMark[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items))
}

export function pendingAttendanceCount(): number {
  return readQueue().length
}

export function enqueueAttendanceMark(studentId: string, present: boolean, reason?: string) {
  const queue = readQueue().filter((q) => q.studentId !== studentId)
  queue.push({ studentId, present, reason, queuedAt: Date.now() })
  writeQueue(queue)
}

/** Persist mark; queue locally if offline or API fails. */
export async function upsertAttendanceMarkQueued(
  studentId: string,
  present: boolean,
  reason?: string,
): Promise<{ ok: boolean; queued?: boolean; error?: string }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    enqueueAttendanceMark(studentId, present, reason)
    return { ok: true, queued: true }
  }
  const result = await upsertAttendanceMark(studentId, present, reason)
  if (!result.ok) {
    enqueueAttendanceMark(studentId, present, reason)
    return { ok: true, queued: true, error: result.error }
  }
  return { ok: true }
}

export async function flushAttendanceQueue(): Promise<{ flushed: number; remaining: number }> {
  const queue = readQueue()
  if (!queue.length) return { flushed: 0, remaining: 0 }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { flushed: 0, remaining: queue.length }
  }

  const remaining: QueuedAttendanceMark[] = []
  let flushed = 0
  for (const item of queue) {
    const result = await upsertAttendanceMark(item.studentId, item.present, item.reason)
    if (result.ok) flushed += 1
    else remaining.push(item)
  }
  writeQueue(remaining)
  return { flushed, remaining: remaining.length }
}

let syncStarted = false

export function startAttendanceQueueSync(onFlush?: (result: { flushed: number; remaining: number }) => void) {
  if (syncStarted || typeof window === 'undefined') return
  syncStarted = true
  const run = () => {
    void flushAttendanceQueue().then((result) => {
      if (result.flushed > 0) onFlush?.(result)
    })
  }
  window.addEventListener('online', run)
  window.setInterval(run, 30_000)
  run()
}
