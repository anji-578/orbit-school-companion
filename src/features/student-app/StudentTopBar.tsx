import { ArrowLeft, Bell, LogOut, Moon, Settings, Sun } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { useOrbitStore } from '../../store/orbitStore'
import { titleForFrame } from './studentNav'
import { useStudentNav } from './StudentNavContext'

export function StudentTopBar() {
  const { current, canGoBack, pop, push, tab } = useStudentNav()
  const notifications = useOrbitStore((s) => s.notifications)
  const theme = useOrbitStore((s) => s.theme)
  const setTheme = useOrbitStore((s) => s.setTheme)
  const logout = useAuthStore((s) => s.logout)

  const unread = notifications.filter(
    (a) => a.unread && (a.role === 'student' || a.role === 'all'),
  ).length

  const title = titleForFrame(current)
  const homeRoot = tab === 'home' && !canGoBack
  const showTitle = canGoBack || tab !== 'home'
  const showSettings = tab === 'me' && !canGoBack

  return (
    <header className="student-topbar shrink-0 sticky top-0 z-20 bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="flex items-center gap-2 px-4 py-3 max-w-lg mx-auto w-full">
        {canGoBack ? (
          <button type="button" onClick={pop} className="home-icon-btn" aria-label="Back">
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="home-logo-mark" aria-hidden>
              <span className="home-logo-ring" />
            </span>
            <span className="text-[15px] font-extrabold tracking-[0.12em] text-[var(--fg)]">ORBIT</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {showTitle && !homeRoot ? (
            <h1 className="text-sm font-bold truncate text-[var(--fg)] pl-1">{title}</h1>
          ) : null}
        </div>

        <button type="button" onClick={() => push('alerts')} className="home-icon-btn relative" aria-label="Notifications">
          <Bell className="h-4 w-4" aria-hidden />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 h-[16px] min-w-[16px] px-1 rounded-full bg-[#ef4444] text-[9px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>

        {homeRoot ? (
          <>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="home-icon-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>
            <button type="button" onClick={() => void logout()} className="home-icon-btn" aria-label="Sign out">
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : null}

        {showSettings ? (
          <button type="button" onClick={() => push('settings')} className="home-icon-btn" aria-label="Settings">
            <Settings className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </header>
  )
}
