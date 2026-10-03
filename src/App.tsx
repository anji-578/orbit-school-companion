import { useEffect, useState, type ReactNode } from 'react'
import { AuthGate } from './auth/AuthGate'
import { ThemeSync } from './components/brand/ThemeSync'
import { AppQueryProvider } from '@/app/providers/QueryProvider'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { ConsentGate } from './features/consent/ConsentGate'
import { getPublicEnv } from '@/shared/config/env'

getPublicEnv()

function DevShell() {
  const [node, setNode] = useState<ReactNode>(null)
  useEffect(() => {
    const path = window.location.pathname
    if (path.startsWith('/dev/ui')) {
      void import('@/dev/UiGallery').then((m) => setNode(<m.UiGallery />))
    } else if (path.startsWith('/dev/student')) {
      void import('@/dev/StudentPreview').then((m) =>
        setNode(
          <AppQueryProvider>
            <m.StudentPreview />
          </AppQueryProvider>,
        ),
      )
    }
  }, [])
  return node
}

export default function App() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const path = window.location.pathname
    if (path.startsWith('/dev/ui') || path.startsWith('/dev/student')) {
      return (
        <ErrorBoundary label="dev-ui">
          <DevShell />
        </ErrorBoundary>
      )
    }
  }

  return (
    <ErrorBoundary label="root">
      <AppQueryProvider>
        <ThemeSync />
        <ConsentGate>
          <AuthGate />
        </ConsentGate>
      </AppQueryProvider>
    </ErrorBoundary>
  )
}
