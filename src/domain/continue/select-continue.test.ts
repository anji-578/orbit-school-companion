import { selectContinueTarget } from './select-continue'

describe('selectContinueTarget', () => {
  it('prefers homework over chapters', () => {
    const r = selectContinueTarget(
      [{ id: 1, subject: 'Math', task: 'Ex', due: 'Tomorrow', completed: false }],
      [{ id: 'c1', subject: 'Math', title: 'Algebra', progress: 40 }],
    )
    expect(r?.kind).toBe('homework')
  })

  it('falls back to unfinished chapter', () => {
    const r = selectContinueTarget(
      [],
      [
        { id: 'c1', subject: 'Math', title: 'Done', progress: 100 },
        { id: 'c2', subject: 'Sci', title: 'Cells', progress: 20 },
      ],
    )
    expect(r).toEqual({ kind: 'chapter', chapter: expect.objectContaining({ id: 'c2' }) })
  })

  it('returns null when caught up', () => {
    expect(selectContinueTarget([], [{ id: 'c1', subject: 'Math', title: 'Done', progress: 100 }])).toBeNull()
  })
})
