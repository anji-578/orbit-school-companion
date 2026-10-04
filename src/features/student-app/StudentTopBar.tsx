import { useOrbitStore } from '../../store/orbitStore'
import { titleForFrame } from './studentNav'
import { useStudentNav } from './StudentNavContext'
import { ICON } from '@/shared/ui/orbit'

export function StudentTopBar() {
  const { current, canGoBack, pop, push, openLogoutConfirm } = useStudentNav()
  const notifications = useOrbitStore((s) => s.notifications)
  const theme = useOrbitStore((s) => s.theme)
  const setTheme = useOrbitStore((s) => s.setTheme)

  const unread = notifications.filter((a) => a.unread && (a.role === 'student' || a.role === 'all')).length

  const title = titleForFrame(current)
  const rootTab = !canGoBack
  const Back = ICON.chrome.back
  const Bell = ICON.chrome.bell
  const ThemeIcon = theme === 'light' ? ICON.chrome.themeDark : ICON.chrome.themeLight
  const SignOut = ICON.chrome.signOut

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }

  return (
    <header className="student-topbar sticky top-0 z-20 shrink-0 bg-o-bg/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-lg items-center gap-2 px-5 py-3">
        {canGoBack ? (
          <button
            type="button"
            onClick={pop}
            className="o-focus inline-flex h-11 w-11 items-center justify-center rounded-full border border-o-border bg-o-surface-2 text-o-muted"
            aria-label="Back"
          >
            <Back className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <img src="/art/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="font-display text-[15px] font-extrabold tracking-[0.16em] text-o-text">
              ORBIT
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {canGoBack ? (
            <h1 className="truncate pl-1 font-display text-sm font-bold text-o-text">{title}</h1>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => push('alerts')}
          className="o-focus relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-o-border bg-o-surface-2 text-o-muted"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          {unread > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-o-danger px-1 text-[9px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>

        {rootTab ? (
          <>
            <button
              type="button"
              onClick={cycleTheme}
              className="o-focus inline-flex h-11 w-11 items-center justify-center rounded-full border border-o-border bg-o-surface-2 text-o-muted"
              aria-label={`Theme: ${theme}`}
            >
              <ThemeIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={openLogoutConfirm}
              className="o-focus inline-flex h-11 w-11 items-center justify-center rounded-full border border-o-border bg-o-surface-2 text-o-muted"
              aria-label="Sign out"
            >
              <SignOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
