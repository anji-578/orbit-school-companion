import { beforeEach, describe, expect, it, vi } from 'vitest'
import { enqueueMutation, flushMutationQueue, listMutations, registerMutationHandler } from './mutation-queue'

describe('mutation-queue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('enqueues and dedupes by idempotency key', () => {
    enqueueMutation('homework_completion', { id: 1 }, 'hw-1')
    enqueueMutation('homework_completion', { id: 1, v: 2 }, 'hw-1')
    expect(listMutations()).toHaveLength(1)
    expect(listMutations()[0]?.payload).toEqual({ id: 1, v: 2 })
  })

  it('flushes successfully handled items', async () => {
    const handler = vi.fn(async () => true)
    registerMutationHandler('attendance', handler)
    enqueueMutation('attendance', { day: 'Mon' }, 'att-1')
    await flushMutationQueue()
    expect(handler).toHaveBeenCalledOnce()
    expect(listMutations()).toHaveLength(0)
  })
})
