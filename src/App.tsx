import { AuthGate } from './auth/AuthGate'
import { ThemeSync } from './components/brand/ThemeSync'
import { AppQueryProvider } from '@/app/providers/QueryProvider'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { ConsentGate } from './features/consent/ConsentGate'
import { getPublicEnv } from '@/shared/config/env'

// Validate public env once at module load.
getPublicEnv()

export default function App() {
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
