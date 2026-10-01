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
      className="student-bottom-nav safe-bottom shrink-0 border-t border-white/[0.08] bg-orbit-bg/95 backdrop-blur-xl"
      aria-label="Student"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => setTab(id)}
                className={`student-tab-btn flex w-full flex-col items-center gap-0.5 px-1 py-2.5 transition ${
                  active ? 'is-active' : 'text-orbit-text-muted'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className="student-tab-icon h-5 w-5"
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className={`student-tab-label text-[10px] font-semibold tracking-wide ${active ? '' : 'opacity-80'}`}>
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
