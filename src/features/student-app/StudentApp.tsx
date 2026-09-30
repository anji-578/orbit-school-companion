import { useEffect } from 'react'
import { useOrbitStore } from '../../store/orbitStore'
import { ToastHost } from '../../components/layout/ToastHost'
import { StudentNavProvider, useStudentNav } from './StudentNavContext'
import { StudentTopBar } from './StudentTopBar'
import { StudentBottomNav } from './StudentBottomNav'
import { StudentScreen } from './StudentScreen'
import { AskOrbitSheet } from './components/AskOrbitSheet'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { startOfflineQueuePolling } from '@/services/offline/mutation-queue'
import { useNow } from '@/shared/lib/useNow'

function StudentAppBody() {
  const { current, deepFocus, tab } = useStudentNav()
  const hydrateFromSupabase = useOrbitStore((s) => s.hydrateFromSupabase)
  const setRole = useOrbitStore((s) => s.setRole)
  const role = useOrbitStore((s) => s.role)
  // Minute clock for future countdown widgets; pauses when backgrounded.
  useNow(60_000)

  useEffect(() => {
    if (role !== 'student') setRole('student')
  }, [role, setRole])

  useEffect(() => {
    void hydrateFromSupabase()
  }, [hydrateFromSupabase])

  useEffect(() => startOfflineQueuePolling(), [])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', '#2563eb')
    document.documentElement.style.setProperty('--accent2', '#38bdf8')
  }, [])

  return (
    <div className="student-app orbit-root h-dvh w-full flex flex-col relative antialiased selection:bg-[var(--accent)] selection:text-white">
      <StudentTopBar />
      <main className="flex-1 min-h-0 overflow-y-auto orbit-scroll student-main">
        <div className="max-w-lg mx-auto w-full px-4 py-4 fade-up">
          <ErrorBoundary label={`tab:${tab}`}>
            <StudentScreen dest={current.dest} />
          </ErrorBoundary>
        </div>
      </main>
      {!deepFocus ? <StudentBottomNav /> : null}
      <AskOrbitSheet />
      <ToastHost />
    </div>
  )
}

/** Full student product shell — Home · Learn · Grow · Me. */
export function StudentApp() {
  return (
    <StudentNavProvider>
      <ErrorBoundary label="student-app">
        <StudentAppBody />
      </ErrorBoundary>
    </StudentNavProvider>
  )
}
