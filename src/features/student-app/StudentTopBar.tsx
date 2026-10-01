import { ArrowLeft, Bell, LogOut, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { useOrbitStore } from '../../store/orbitStore'
import { titleForFrame } from './studentNav'
import { useStudentNav } from './StudentNavContext'

export function StudentTopBar() {
  const { current, canGoBack, pop, push } = useStudentNav()
  const notifications = useOrbitStore((s) => s.notifications)
  const theme = useOrbitStore((s) => s.theme)
  const setTheme = useOrbitStore((s) => s.setTheme)
  const logout = useAuthStore((s) => s.logout)

  const unread = notifications.filter(
    (a) => a.unread && (a.role === 'student' || a.role === 'all'),
  ).length

  const title = titleForFrame(current)
  const rootTab = !canGoBack
  const showTitle = canGoBack

  return (
    <header className="student-topbar sticky top-0 z-20 shrink-0 bg-orbit-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 py-3">
        {canGoBack ? (
          <button type="button" onClick={pop} className="orbit-icon-btn" aria-label="Back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="home-logo-mark" aria-hidden>
              <span className="home-logo-ring" />
            </span>
            <span className="font-heading text-[15px] font-extrabold tracking-[0.14em] text-white">ORBIT</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {showTitle ? (
            <h1 className="truncate pl-1 font-heading text-sm font-bold text-white">{title}</h1>
          ) : null}
        </div>

        <button type="button" onClick={() => push('alerts')} className="orbit-icon-btn relative" aria-label="Notifications">
          <Bell className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>

        {rootTab ? (
          <>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="orbit-icon-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              ) : (
                <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              )}
            </button>
            <button type="button" onClick={() => void logout()} className="orbit-icon-btn" aria-label="Sign out">
              <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
