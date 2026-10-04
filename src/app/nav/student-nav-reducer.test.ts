import { deepFocus, handleHardwareBack, initialNavState, studentNavReducer } from './student-nav-reducer'

describe('studentNavReducer', () => {
  it('setTab resets stack and closes Ask Orbit', () => {
    let s = initialNavState('home')
    s = studentNavReducer(s, { type: 'openAskOrbit', seed: 'hi' })
    s = studentNavReducer(s, { type: 'setTab', tab: 'learn' })
    expect(s.tab).toBe('learn')
    expect(s.stack).toEqual([{ dest: 'learn' }])
    expect(s.askOrbitOpen).toBe(false)
  })

  it('push dedupes identical frames', () => {
    let s = initialNavState('learn')
    s = studentNavReducer(s, { type: 'push', dest: 'subject', params: { subject: 'Math' } })
    const once = s.stack.length
    s = studentNavReducer(s, { type: 'push', dest: 'subject', params: { subject: 'Math' } })
    expect(s.stack.length).toBe(once)
  })

  it('push nests and deepFocus at length >= 3', () => {
    let s = initialNavState('learn')
    s = studentNavReducer(s, { type: 'push', dest: 'subject', params: { subject: 'Sci' } })
    s = studentNavReducer(s, { type: 'push', dest: 'homework', params: { subject: 'Sci' } })
    expect(deepFocus(s.stack)).toBe(true)
  })

  it('pop is no-op at root', () => {
    const s = initialNavState('me')
    expect(studentNavReducer(s, { type: 'pop' })).toEqual(s)
  })
})

describe('handleHardwareBack', () => {
  it('closes logout confirm before Ask Orbit or pop', () => {
    let s = initialNavState('home')
    s = studentNavReducer(s, { type: 'openLogoutConfirm' })
    const r = handleHardwareBack(s)
    expect(r.state.logoutConfirmOpen).toBe(false)
    expect(r.exitApp).toBe(false)
  })

  it('closes Ask Orbit first', () => {
    let s = initialNavState('home')
    s = studentNavReducer(s, { type: 'openAskOrbit' })
    const r = handleHardwareBack(s)
    expect(r.state.askOrbitOpen).toBe(false)
    expect(r.exitApp).toBe(false)
  })

  it('exits only on Home root', () => {
    expect(handleHardwareBack(initialNavState('home')).exitApp).toBe(true)
    const learn = handleHardwareBack(initialNavState('learn'))
    expect(learn.exitApp).toBe(false)
    expect(learn.state.tab).toBe('home')
  })
})
