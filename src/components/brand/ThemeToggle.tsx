import { Moon, Sun } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'

/** Interactive dark / light switch with sliding thumb. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useOrbitStore((s) => s.theme)
  const toggleTheme = useOrbitStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={`theme-toggle relative inline-flex h-9 w-[4.25rem] items-center rounded-full border p-1 transition-colors duration-300 ${className}`}
    >
      <span
        className={`absolute inset-y-1 w-7 rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
          isDark ? 'translate-x-[2.05rem] bg-[#0B1F44] text-[#38BDF8]' : 'translate-x-0 bg-white text-[#F59E0B]'
        }`}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" aria-hidden /> : <Sun className="h-3.5 w-3.5" aria-hidden />}
      </span>
      <span className="relative z-0 flex w-full items-center justify-between px-1.5 text-[9px] font-black uppercase tracking-wide">
        <Sun className={`h-3 w-3 ${isDark ? 'text-slate-500' : 'text-transparent'}`} aria-hidden />
        <Moon className={`h-3 w-3 ${isDark ? 'text-transparent' : 'text-slate-400'}`} aria-hidden />
      </span>
    </button>
  )
}
