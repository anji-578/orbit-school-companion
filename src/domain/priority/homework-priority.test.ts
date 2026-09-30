import { dueUrgency, rankHomeworkPriority, selectUrgentHomework, taskMinutes } from './homework-priority'

describe('homework priority', () => {
  const base = {
    id: 1,
    subject: 'Science',
    task: 'Worksheet',
    due: 'Next week',
    completed: false,
  }

  it('taskMinutes uses difficulty defaults', () => {
    expect(taskMinutes({ ...base, difficulty: 'Hard' })).toBe(45)
    expect(taskMinutes({ ...base, difficulty: 'Easy' })).toBe(15)
    expect(taskMinutes({ ...base, estimatedMinutes: 12 })).toBe(12)
  })

  it('ranks today/tomorrow first', () => {
    const ranked = rankHomeworkPriority([
      { ...base, id: 1, due: 'in 3 days', difficulty: 'Hard' },
      { ...base, id: 2, due: 'Tomorrow', difficulty: 'Easy' },
      { ...base, id: 3, due: 'Completed', completed: true },
    ])
    expect(ranked.map((t) => t.id)).toEqual([2, 1])
  })

  it('selectUrgentHomework prefers due-soon then first ranked', () => {
    expect(
      selectUrgentHomework([
        { ...base, id: 1, due: 'Next week' },
        { ...base, id: 2, due: 'Today' },
      ])?.id,
    ).toBe(2)
  })

  it('dueUrgency empty-ish defaults to 2', () => {
    expect(dueUrgency('')).toBe(2)
    expect(dueUrgency('2 days')).toBe(1)
  })
})
