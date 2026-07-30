import { useEffect, useState } from 'react'
import { useAuthStore } from './authStore'
import { LandingPage } from '../features/auth/LandingPage'
import { LoginPage } from '../features/auth/LoginPage'
import { AppShell } from '../AppShell'
import { isSupabaseConfigured } from '../lib/supabaseConfig'

/** Routes: Landing (4 profiles) → Login → Authenticated shell */
export function AuthGate() {
  const session = useAuthStore((s) => s.session)
  const pendingRole = useAuthStore((s) => s.pendingRole)
  const bootstrapped = useAuthStore((s) => s.bootstrapped)
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const [ready, setReady] = useState(bootstrapped)

  useEffect(() => {
    let alive = true
    ;(async () => {
      await bootstrap()
      if (alive) setReady(true)
    })()
    return () => {
      alive = false
    }
  }, [bootstrap])

  if (!ready) {
    return (
      <div className="orbit-root min-h-dvh w-full flex items-center justify-center">
        <p className="text-sm text-slate-400">
          {isSupabaseConfigured() ? 'Connecting to Orbit…' : 'Loading Orbit…'}
        </p>
      </div>
    )
  }

  if (session) return <AppShell />
  if (pendingRole) return <LoginPage role={pendingRole} />
  return <LandingPage />
}
