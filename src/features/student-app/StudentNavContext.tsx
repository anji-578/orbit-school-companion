import { useEffect, useMemo, useReducer, useCallback, useRef, type ReactNode } from 'react'
import { createContext, useContext } from 'react'
import type { StudentDestination, StudentNavParams, StudentTab } from './studentNav'
import {
  deepFocus as computeDeepFocus,
  handleHardwareBack,
  initialNavState,
  studentNavReducer,
  type NavState,
} from '@/app/nav/student-nav-reducer'
import { resolveOrbitDeepLink } from '@/app/nav/deep-link'
import { logger } from '@/services/logger'

const NAV_PERSIST_KEY = 'orbit-student-nav-v1'
const NAV_TTL_MS = 1000 * 60 * 60 * 12

type StudentNavValue = {
  tab: StudentTab
  stack: NavState['stack']
  setTab: (tab: StudentTab) => void
  push: (dest: StudentDestination, params?: StudentNavParams, title?: string) => void
  pop: () => void
  resetToTab: (tab: StudentTab) => void
  current: NavState['stack'][number]
  canGoBack: boolean
  params: StudentNavParams
  deepFocus: boolean
  askOrbitOpen: boolean
  askOrbitSeed: string
  logoutConfirmOpen: boolean
  openAskOrbit: (seed?: string) => void
  closeAskOrbit: () => void
  openLogoutConfirm: () => void
  closeLogoutConfirm: () => void
}

const StudentNavContext = createContext<StudentNavValue | null>(null)

function loadPersistedNav(): NavState | null {
  try {
    const raw = localStorage.getItem(NAV_PERSIST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt: number; state: NavState }
    if (!parsed?.state || Date.now() - parsed.savedAt > NAV_TTL_MS) return null
    if (!parsed.state.stack?.length) return null
    return {
      ...parsed.state,
      logoutConfirmOpen: Boolean(parsed.state.logoutConfirmOpen),
      askOrbitOpen: Boolean(parsed.state.askOrbitOpen),
      askOrbitSeed: parsed.state.askOrbitSeed ?? '',
    }
  } catch {
    return null
  }
}

function persistNav(state: NavState) {
  try {
    localStorage.setItem(NAV_PERSIST_KEY, JSON.stringify({ savedAt: Date.now(), state }))
  } catch {
    /* quota */
  }
}

export function StudentNavProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    studentNavReducer,
    undefined,
    () => loadPersistedNav() ?? initialNavState('home'),
  )
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    persistNav(state)
  }, [state])

  useEffect(() => {
    const handles: Array<{ remove: () => Promise<void> }> = []
    void (async () => {
      try {
        const { App } = await import('@capacitor/app')
        handles.push(
          await App.addListener('backButton', ({ canGoBack }) => {
            const result = handleHardwareBack(stateRef.current)
            if (result.exitApp) {
              if (!canGoBack) void App.exitApp()
              return
            }
            dispatch({ type: 'restore', state: result.state })
          }),
        )
        handles.push(
          await App.addListener('appUrlOpen', ({ url }) => {
            const link = resolveOrbitDeepLink(url)
            if (!link.ok) {
              dispatch({ type: 'push', dest: 'alerts', title: 'Notifications' })
              return
            }
            dispatch({
              type: 'push',
              dest: link.dest,
              params: link.params,
              title: link.title,
            })
          }),
        )
      } catch {
        /* web */
      }
    })()
    return () => {
      for (const h of handles) void h.remove()
    }
  }, [])

  const setTab = useCallback((tab: StudentTab) => dispatch({ type: 'setTab', tab }), [])
  const resetToTab = setTab
  const push = useCallback((dest: StudentDestination, params?: StudentNavParams, title?: string) => {
    dispatch({ type: 'push', dest, params, title })
  }, [])
  const pop = useCallback(() => dispatch({ type: 'pop' }), [])
  const openAskOrbit = useCallback((seed?: string) => {
    dispatch({ type: 'openAskOrbit', seed })
    logger.debug('ask_orbit_open')
  }, [])
  const closeAskOrbit = useCallback(() => dispatch({ type: 'closeAskOrbit' }), [])
  const openLogoutConfirm = useCallback(() => dispatch({ type: 'openLogoutConfirm' }), [])
  const closeLogoutConfirm = useCallback(() => dispatch({ type: 'closeLogoutConfirm' }), [])

  const current = state.stack[state.stack.length - 1] ?? { dest: 'home' as const }
  const canGoBack = state.stack.length > 1
  const params = current.params ?? {}
  const deepFocus = computeDeepFocus(state.stack)

  const value = useMemo(
    () => ({
      tab: state.tab,
      stack: state.stack,
      setTab,
      push,
      pop,
      resetToTab,
      current,
      canGoBack,
      params,
      deepFocus,
      askOrbitOpen: state.askOrbitOpen,
      askOrbitSeed: state.askOrbitSeed,
      logoutConfirmOpen: state.logoutConfirmOpen,
      openAskOrbit,
      closeAskOrbit,
      openLogoutConfirm,
      closeLogoutConfirm,
    }),
    [
      state.tab,
      state.stack,
      state.askOrbitOpen,
      state.askOrbitSeed,
      state.logoutConfirmOpen,
      setTab,
      push,
      pop,
      resetToTab,
      current,
      canGoBack,
      params,
      deepFocus,
      openAskOrbit,
      closeAskOrbit,
      openLogoutConfirm,
      closeLogoutConfirm,
    ],
  )

  return <StudentNavContext.Provider value={value}>{children}</StudentNavContext.Provider>
}

export function useStudentNav() {
  const ctx = useContext(StudentNavContext)
  if (!ctx) throw new Error('useStudentNav must be used inside StudentNavProvider')
  return ctx
}
