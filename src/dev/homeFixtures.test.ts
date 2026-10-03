import { describe, expect, it } from 'vitest'
import { HOME_BUSY_TOPIC, homeFixtureState, isHomeFixtureId } from './homeFixtures'
import { presentStreak } from '@/domain/streak/present-streak'
import { selectUrgentHomework } from '@/domain/priority/homework-priority'

describe('home fixtures', () => {
  it('accepts only the three query ids', () => {
    expect(isHomeFixtureId('home-busy')).toBe(true)
    expect(isHomeFixtureId('home-clear')).toBe(true)
    expect(isHomeFixtureId('home-empty')).toBe(true)
    expect(isHomeFixtureId('1')).toBe(false)
  })

  it('busy matches Home hooks: 3 classes, 2 open homework, 1 exam, 4-day streak', () => {
    const s = homeFixtureState('home-busy')
    const day = s.timetableByDay.MON
    expect(day?.theory).toHaveLength(3)
    expect(day?.theory[0]?.name).toBe('Mathematics')
    expect(day?.theory[0]?.start).toBe('08:00')
    expect(s.tasks.filter((t) => !t.completed)).toHaveLength(2)
    expect(selectUrgentHomework(s.tasks)?.task).toBe('Science worksheet')
    expect(s.calendarEvents.filter((e) => e.category === 'Exams')).toHaveLength(1)
    expect(presentStreak(s.attendanceRecords)).toBe(4)
    expect(HOME_BUSY_TOPIC).toBe('Linear Equations')
    expect(s.tasks.some((t) => t.task === 'Complete textbook exercise')).toBe(true)
  })

  it('clear and empty have no timetable slots and no homework', () => {
    for (const id of ['home-clear', 'home-empty'] as const) {
      const s = homeFixtureState(id)
      expect(s.timetableByDay.MON?.theory).toHaveLength(0)
      expect(s.tasks).toHaveLength(0)
    }
  })
})
