import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { StudentDestination, StudentTab } from './studentNav'
import { tabForDestination } from './studentNav'

type StudentNavValue = {
  tab: StudentTab
  stack: StudentDestination[]
  setTab: (tab: StudentTab) => void
  push: (dest: StudentDestination) => void
  pop: () => void
  resetToTab: (tab: StudentTab) => void
  current: StudentDestination
  canGoBack: boolean
}

const StudentNavContext = createContext<StudentNavValue | null>(null)

const TAB_ROOT: Record<StudentTab, StudentDestination> = {
  home: 'home',
  learn: 'learn',
  grow: 'grow',
  me: 'me',
}

export function StudentNavProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<StudentTab>('home')
  const [stack, setStack] = useState<StudentDestination[]>(['home'])

  const setTab = useCallback((next: StudentTab) => {
    setTabState(next)
    setStack([TAB_ROOT[next]])
  }, [])

  const resetToTab = setTab

  const push = useCallback((dest: StudentDestination) => {
    const nextTab = tabForDestination(dest)
    setTabState(nextTab)
    setStack(() => {
      const root = TAB_ROOT[nextTab]
      if (dest === root) return [root]
      return [root, dest]
    })
  }, [])

  const pop = useCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) return prev
      return prev.slice(0, -1)
    })
  }, [])

  const current = stack[stack.length - 1] ?? 'home'
  const canGoBack = stack.length > 1

  const value = useMemo(
    () => ({ tab, stack, setTab, push, pop, resetToTab, current, canGoBack }),
    [tab, stack, setTab, push, pop, resetToTab, current, canGoBack],
  )

  return <StudentNavContext.Provider value={value}>{children}</StudentNavContext.Provider>
}

export function useStudentNav() {
  const ctx = useContext(StudentNavContext)
  if (!ctx) throw new Error('useStudentNav must be used inside StudentNavProvider')
  return ctx
}
