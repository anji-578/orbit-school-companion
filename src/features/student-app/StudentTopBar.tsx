import { ArrowLeft, Bell, Settings } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { titleForFrame } from './studentNav'
import { useStudentNav } from './StudentNavContext'

export function StudentTopBar() {
  const { current, canGoBack, pop, push, tab } = useStudentNav()
  const notifications = useOrbitStore((s) => s.notifications)

  const unread = notifications.filter(
    (a) => a.unread && (a.role === 'student' || a.role === 'all'),
  ).length

  const title = titleForFrame(current)
  const showTitle = canGoBack || tab !== 'home'
  const showSettings = tab === 'me' && !canGoBack

  return (
    <header className="student-topbar shrink-0 sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 py-2.5 max-w-lg mx-auto w-full">
        {canGoBack ? (
          <button
            type="button"
            onClick={pop}
            className="h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <div className="h-9 w-9 flex items-center justify-center">
            <span className="font-brand text-lg text-[var(--accent)] leading-none">O</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {showTitle ? (
            <h1 className="text-sm font-bold truncate text-[var(--fg)]">{title}</h1>
          ) : (
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Orbit</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => push('alerts')}
          className="relative h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" aria-hidden />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>

        {showSettings ? (
          <button
            type="button"
            onClick={() => push('settings')}
            className="h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </header>
  )
}
