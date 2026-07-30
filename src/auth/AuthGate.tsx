import { useAuthStore } from './authStore'
import { LandingPage } from '../features/auth/LandingPage'
import { LoginPage } from '../features/auth/LoginPage'
import { AppShell } from '../AppShell'

/** Routes: Landing (4 profiles) → Login → Authenticated shell */
export function AuthGate() {
  const session = useAuthStore((s) => s.session)
  const pendingRole = useAuthStore((s) => s.pendingRole)

  if (session) return <AppShell />
  if (pendingRole) return <LoginPage role={pendingRole} />
  return <LandingPage />
}
