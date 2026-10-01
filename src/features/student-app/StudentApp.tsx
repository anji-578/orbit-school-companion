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
import { loadDemoFixturesIfEnabled } from '@/dev/loadDemoFixtures'

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
    void loadDemoFixturesIfEnabled()
  }, [hydrateFromSupabase])

  useEffect(() => startOfflineQueuePolling(), [])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', '#1E7BFF')
    document.documentElement.style.setProperty('--accent2', '#38BDF8')
  }, [])

  return (
    <div className="student-app orbit-root relative flex h-dvh w-full flex-col antialiased selection:bg-o-primary selection:text-white">
      <StudentTopBar />
      <main className="student-main orbit-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="fade-up mx-auto w-full max-w-lg px-5 py-4">
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
