import { useEffect, useMemo } from 'react'
import { Header } from './components/layout/Header'
import { MobileSimulator } from './components/layout/MobileSimulator'
import { Sidebar, getRoleMeta } from './components/layout/Sidebar'
import { ToastHost } from './components/layout/ToastHost'
import { MainContent } from './features/MainContent'
import { translate } from './i18n'
import { useAuthStore } from './auth/authStore'
import { useOrbitStore } from './store/orbitStore'
import { childClassLabel, childDisplayName } from './lib/linkedStudent'

function studentGreetingKey(hour = new Date().getHours()): 'goodMorning' | 'goodAfternoon' | 'goodEvening' {
  if (hour < 12) return 'goodMorning'
  if (hour < 17) return 'goodAfternoon'
  return 'goodEvening'
}

/** Authenticated application chrome (sidebar + header + content). */
export function AppShell() {
  const session = useAuthStore((s) => s.session)
  const role = useOrbitStore((s) => s.role)
  const lang = useOrbitStore((s) => s.lang)
  const tickBus = useOrbitStore((s) => s.tickBus)
  const setNotifOpen = useOrbitStore((s) => s.setNotifOpen)
  const notifOpen = useOrbitStore((s) => s.notifOpen)
  const setRole = useOrbitStore((s) => s.setRole)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const hydrateFromSupabase = useOrbitStore((s) => s.hydrateFromSupabase)
  const meta = getRoleMeta(role)
  const t = (key: string) => translate(lang, key)

  // Keep orbit role locked to authenticated persona
  useEffect(() => {
    if (session && session.role !== role) {
      setRole(session.role)
    }
  }, [session, role, setRole])

  useEffect(() => {
    if (!session) return
    void hydrateFromSupabase()
  }, [session, hydrateFromSupabase])

  useEffect(() => {
    const id = window.setInterval(() => tickBus(), 900)
    return () => window.clearInterval(id)
  }, [tickBus])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', meta.accent)
    document.documentElement.style.setProperty('--accent2', meta.accent2)
  }, [meta.accent, meta.accent2])

  useEffect(() => {
    if (!notifOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [notifOpen, setNotifOpen])

  const displayName = session?.displayName ?? 'Orbit User'
  const studentFullName = childDisplayName(linkedStudent, displayName)
  const linkedClassLabel =
    childClassLabel(linkedStudent) ||
    (linkedStudent?.className
      ? `${linkedStudent.className}${linkedStudent.section ? `-${linkedStudent.section}` : ''}`
      : null)
  const greetKey = role === 'student' ? studentGreetingKey() : meta.greetKey
  const greetName = role === 'student' ? studentFullName : displayName.split(' ')[0]
  const subtitle = useMemo(() => {
    if (role === 'student') {
      return linkedClassLabel || session?.subtitle || t(meta.subKey)
    }
    if (role === 'parent' && linkedClassLabel) return linkedClassLabel
    return session?.subtitle ?? t(meta.subKey)
  }, [role, linkedClassLabel, session?.subtitle, lang, meta.subKey])

  return (
    <div
      className="orbit-root h-dvh w-full flex relative antialiased selection:bg-[var(--accent)] selection:text-black"
      style={{ ['--accent' as string]: meta.accent, ['--accent2' as string]: meta.accent2 }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-dvh">
        <Header />
        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto orbit-scroll">
          <div className="fade-up">
            <div className="flex items-center gap-2 uppercase tracking-widest text-slate-400 mb-1.5 text-[11px]">
              <span aria-hidden>{meta.emoji}</span>
              <span>{t(meta.labelKey)}</span>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {role === 'student' ? (
                <>
                  {t(greetKey)} <span aria-hidden>👋</span>
                </>
              ) : (
                <>
                  {t(greetKey)}, {greetName}
                </>
              )}
            </h1>
            {role === 'student' ? (
              <>
                <p className="text-base sm:text-lg font-semibold text-white/95 mt-1 tracking-tight">
                  {greetName}
                </p>
                <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            )}
            {session?.provider === 'local-demo' ? (
              <p className="text-[10px] text-amber-300/90 mt-2 font-semibold">{t('authDemoHint')}</p>
            ) : null}
          </div>
          <MainContent />
        </main>
      </div>

      <MobileSimulator />
      <ToastHost />
    </div>
  )
}
