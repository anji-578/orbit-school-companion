import { describe, expect, it } from 'vitest'
import { routeForNotification } from './notification-route'

describe('routeForNotification', () => {
  it('routes homework to Learn homework', () => {
    expect(routeForNotification({ title: 'Homework assigned' }).dest).toBe('homework')
  })

  it('routes exams to assessments', () => {
    expect(routeForNotification({ eventType: 'exam', title: 'Science test' }).dest).toBe('assessments')
  })

  it('routes attendance alerts to Me attendance', () => {
    expect(routeForNotification({ eventType: 'absent' }).dest).toBe('attendance')
  })

  it('falls back to notifications center', () => {
    expect(routeForNotification({ title: 'Hello' }).dest).toBe('alerts')
  })
})
