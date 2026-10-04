import { useStudentNav } from '../StudentNavContext'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'

const NAV_PERSIST_KEY = 'orbit-student-nav-v1'

export function LogoutConfirm() {
  const { logoutConfirmOpen, closeLogoutConfirm } = useStudentNav()
  const logout = useAuthStore((s) => s.logout)
  const clearSensitiveSession = useOrbitStore((s) => s.clearSensitiveSession)

  if (!logoutConfirmOpen) return null

  const confirm = async () => {
    closeLogoutConfirm()
    clearSensitiveSession()
    try {
      localStorage.removeItem(NAV_PERSIST_KEY)
    } catch {
      /* ignore */
    }
    await logout()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-5 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        className="o-card w-full max-w-sm space-y-4 p-5"
      >
        <h2 id="logout-confirm-title" className="font-display text-lg font-bold text-o-text">
          Log out?
        </h2>
        <p className="text-sm text-o-muted">Are you sure you want to log out?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={closeLogoutConfirm}
            className="o-focus min-h-11 flex-1 rounded-button border border-o-border text-sm font-semibold text-o-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            className="o-focus min-h-11 flex-1 rounded-button bg-o-danger text-sm font-semibold text-white"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
