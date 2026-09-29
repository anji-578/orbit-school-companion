import type { LucideIcon } from 'lucide-react'
import { BookOpen, Home, Sprout, User } from 'lucide-react'
import type { StudentTab } from './studentNav'
import { useStudentNav } from './StudentNavContext'

const TABS: { id: StudentTab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'grow', label: 'Grow', icon: Sprout },
  { id: 'me', label: 'Me', icon: User },
]

export function StudentBottomNav() {
  const { tab, setTab } = useStudentNav()

  return (
    <nav
      className="student-bottom-nav shrink-0 border-t border-[var(--border-strong)] bg-[var(--panel)]/95 backdrop-blur-xl safe-bottom"
      aria-label="Student"
    >
      <ul className="grid grid-cols-4 max-w-lg mx-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => setTab(id)}
                className={`student-tab-btn w-full flex flex-col items-center gap-0.5 py-2.5 px-1 transition ${
                  active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-2xl transition ${
                    active ? 'bg-[var(--accent)]/15' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} aria-hidden />
                </span>
                <span className={`text-[10px] font-bold tracking-wide ${active ? 'opacity-100' : 'opacity-80'}`}>
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
