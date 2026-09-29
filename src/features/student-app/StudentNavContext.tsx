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

  const setTab = useCallback((next: StudentTab) => {
    setTabState(next)
    setStack([rootFrame(next)])
  }, [])

  const resetToTab = setTab

  const push = useCallback((dest: StudentDestination, params?: StudentNavParams, title?: string) => {
    const nextTab = tabForDestination(dest)
    setTabState(nextTab)
    setStack((prev) => {
      const root = rootFrame(nextTab)
      if (dest === root.dest && !params) return [root]
      // Keep prior frames on the same tab for true back stack; reset root when switching tabs
      const base = prev[0]?.dest === root.dest ? prev : [root]
      const nextFrame: StudentNavFrame = { dest, params, title }
      // Avoid duplicate consecutive frames
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

  const current = stack[stack.length - 1] ?? rootFrame('home')
  const canGoBack = stack.length > 1
  const params = current.params ?? {}

  const value = useMemo(
    () => ({ tab, stack, setTab, push, pop, resetToTab, current, canGoBack, params }),
    [tab, stack, setTab, push, pop, resetToTab, current, canGoBack, params],
  )

  return <StudentNavContext.Provider value={value}>{children}</StudentNavContext.Provider>
}

export function useStudentNav() {
  const ctx = useContext(StudentNavContext)
  if (!ctx) throw new Error('useStudentNav must be used inside StudentNavProvider')
  return ctx
}
