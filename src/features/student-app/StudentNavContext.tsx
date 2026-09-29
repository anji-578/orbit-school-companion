import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StudentDestination, StudentNavFrame, StudentNavParams, StudentTab } from './studentNav'
import { tabForDestination } from './studentNav'

type StudentNavValue = {
  tab: StudentTab
  stack: StudentNavFrame[]
  setTab: (tab: StudentTab) => void
  push: (dest: StudentDestination, params?: StudentNavParams, title?: string) => void
  pop: () => void
  resetToTab: (tab: StudentTab) => void
  current: StudentNavFrame
  canGoBack: boolean
  params: StudentNavParams
  /** Hide bottom nav on Level 3+ focus stacks */
  deepFocus: boolean
  askOrbitOpen: boolean
  askOrbitSeed: string
  openAskOrbit: (seed?: string) => void
  closeAskOrbit: () => void
}

const StudentNavContext = createContext<StudentNavValue | null>(null)

const TAB_ROOT: Record<StudentTab, StudentDestination> = {
  home: 'home',
  learn: 'learn',
  grow: 'grow',
  me: 'me',
}

function rootFrame(tab: StudentTab): StudentNavFrame {
  return { dest: TAB_ROOT[tab] }
}

export function StudentNavProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<StudentTab>('home')
  const [stack, setStack] = useState<StudentNavFrame[]>([rootFrame('home')])
  const [askOrbitOpen, setAskOrbitOpen] = useState(false)
  const [askOrbitSeed, setAskOrbitSeed] = useState('')

  const setTab = useCallback((next: StudentTab) => {
    setTabState(next)
    setStack([rootFrame(next)])
    setAskOrbitOpen(false)
  }, [])

  const resetToTab = setTab

  const push = useCallback((dest: StudentDestination, params?: StudentNavParams, title?: string) => {
    const nextTab = tabForDestination(dest)
    setTabState(nextTab)
    setStack((prev) => {
      const root = rootFrame(nextTab)
      if (dest === root.dest && !params) return [root]
      const base = prev[0]?.dest === root.dest ? prev : [root]
      const nextFrame: StudentNavFrame = { dest, params, title }
      const last = base[base.length - 1]
      if (last?.dest === dest && JSON.stringify(last.params ?? {}) === JSON.stringify(params ?? {})) {
        return base
      }
      return [...base, nextFrame]
    })
  }, [])

  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) return prev
      return prev.slice(0, -1)
    })
  }, [])

  const openAskOrbit = useCallback((seed?: string) => {
    setAskOrbitSeed(seed ?? '')
    setAskOrbitOpen(true)
  }, [])

  const closeAskOrbit = useCallback(() => {
    setAskOrbitOpen(false)
    setAskOrbitSeed('')
  }, [])

  const current = stack[stack.length - 1] ?? rootFrame('home')
  const canGoBack = stack.length > 1
  const params = current.params ?? {}
  const deepFocus = stack.length >= 3

  const value = useMemo(
    () => ({
      tab,
      stack,
      setTab,
      push,
      pop,
      resetToTab,
      current,
      canGoBack,
      params,
      deepFocus,
      askOrbitOpen,
      askOrbitSeed,
      openAskOrbit,
      closeAskOrbit,
    }),
    [
      tab,
      stack,
      setTab,
      push,
      pop,
      resetToTab,
      current,
      canGoBack,
      params,
      deepFocus,
      askOrbitOpen,
      askOrbitSeed,
      openAskOrbit,
      closeAskOrbit,
    ],
  )

  return <StudentNavContext.Provider value={value}>{children}</StudentNavContext.Provider>
}

export function useStudentNav() {
  const ctx = useContext(StudentNavContext)
  if (!ctx) throw new Error('useStudentNav must be used inside StudentNavProvider')
  return ctx
}
