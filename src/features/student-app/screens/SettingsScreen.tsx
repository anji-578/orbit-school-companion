import { LogOut, Moon, Sun } from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { SaCard, SaSection } from '../components/SaUi'

export function SettingsScreen() {
  const theme = useOrbitStore((s) => s.theme)
  const setTheme = useOrbitStore((s) => s.setTheme)
  const lang = useOrbitStore((s) => s.lang)
  const setLang = useOrbitStore((s) => s.setLang)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="space-y-5 pb-4">
      <div className="px-0.5">
        <p className="text-sm text-[var(--muted)]">Preferences for your Orbit companion.</p>
      </div>

      <SaSection eyebrow="Appearance">
        <SaCard className="p-2">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-left"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            ) : (
              <Moon className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            )}
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-[var(--fg)]">Theme</span>
              <span className="text-[11px] text-[var(--muted)]">
                {theme === 'dark' ? 'Dark' : 'Light'} — tap to switch
              </span>
            </span>
          </button>
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Language">
        <SaCard className="p-2">
          <div className="flex gap-2 px-3 py-3">
            {(['en', 'te'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold border transition ${
                  lang === code
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {code === 'en' ? 'English' : 'తెలుగు'}
              </button>
            ))}
          </div>
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Account">
        <SaCard className="p-2">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-left text-rose-500"
          >
            <LogOut className="h-5 w-5" aria-hidden />
            <span className="text-sm font-bold">Sign out</span>
          </button>
        </SaCard>
      </SaSection>
    </div>
  )
}
