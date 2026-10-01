import type { StudentTab } from './studentNav'
import { useStudentNav } from './StudentNavContext'
import { ICON } from '@/shared/ui/orbit'

const TABS: { id: StudentTab; label: string; icon: (typeof ICON.tab)[keyof typeof ICON.tab] }[] = [
  { id: 'home', label: 'Home', icon: ICON.tab.home },
  { id: 'learn', label: 'Learn', icon: ICON.tab.learn },
  { id: 'grow', label: 'Grow', icon: ICON.tab.grow },
  { id: 'me', label: 'Me', icon: ICON.tab.me },
]

export function StudentBottomNav() {
  const { tab, setTab } = useStudentNav()

  return (
    <nav
      className="student-bottom-nav safe-bottom shrink-0 border-t border-o-border bg-o-bg/95 backdrop-blur-xl"
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
                className={`student-tab-btn o-focus flex w-full flex-col items-center gap-1 px-1 py-2.5 ${
                  active ? 'is-active' : 'text-o-muted'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="student-tab-icon-wrap inline-flex h-11 w-11 items-center justify-center rounded-full">
                  <Icon className="student-tab-icon h-6 w-6" strokeWidth={active ? 2.1 : 1.75} aria-hidden />
                </span>
                <span className="student-tab-label text-[12px] font-semibold tracking-wide">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
