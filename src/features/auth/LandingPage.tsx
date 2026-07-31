import { languagesList, translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import type { Lang, Role } from '../../types'
import { useAuthStore } from '../../auth/authStore'
import { getRoleMeta } from '../../components/layout/Sidebar'
import { OrbitLogo } from '../../components/brand/OrbitLogo'
import { ThemeToggle } from '../../components/brand/ThemeToggle'

const PROFILES: Role[] = ['student', 'parent', 'teacher', 'school']

export function LandingPage() {
  const lang = useOrbitStore((s) => s.lang)
  const setLang = useOrbitStore((s) => s.setLang)
  const setPendingRole = useAuthStore((s) => s.setPendingRole)
  const t = (key: string) => translate(lang, key)

  return (
    <div className="orbit-root h-dvh w-full overflow-hidden">
      <div className="h-full max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">
        <header className="flex items-center justify-between gap-3 shrink-0">
          <OrbitLogo variant="lockup" showTagline={false} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <label className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
              <span className="text-[9px] font-bold text-slate-400 uppercase">{t('language')}</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="bg-transparent text-[11px] font-bold text-slate-200 focus:outline-none"
              >
                {languagesList.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[var(--panel)]">
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <section className="fade-up shrink-0 flex flex-col items-center gap-2 pt-1">
          <OrbitLogo variant="hero" />
          <div className="text-center space-y-1 max-w-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('chooseProfile')}</p>
            <h2 className="font-display text-lg sm:text-xl font-bold text-white">{t('landingHeadline')}</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-snug line-clamp-2">{t('landingSub')}</p>
          </div>
        </section>

        <section
          className="grid grid-cols-2 gap-2.5 sm:gap-3 flex-1 min-h-0 content-stretch"
          aria-label={t('chooseProfile')}
        >
          {PROFILES.map((role, idx) => {
            const meta = getRoleMeta(role)
            const Icon = meta.icon
            return (
              <button
                key={role}
                type="button"
                onClick={() => setPendingRole(role)}
                className="glass glass-hover rounded-2xl p-3 sm:p-4 text-left h-full min-h-0 flex flex-col justify-between border border-white/10 fade-up"
                style={{
                  animationDelay: `${idx * 0.04}s`,
                  ['--accent' as string]: meta.accent,
                  ['--accent2' as string]: meta.accent2,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent2})` }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#05070f]" aria-hidden />
                  </div>
                  <span className="text-lg sm:text-xl leading-none" aria-hidden>
                    {meta.emoji}
                  </span>
                </div>
                <div className="space-y-0.5 mt-2">
                  <h3 className="text-sm font-extrabold text-white">{t(meta.labelKey)}</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {t(`${role}LandingDesc`)}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold" style={{ color: meta.accent }}>
                    {t('continueToLogin')} →
                  </span>
                </div>
              </button>
            )
          })}
        </section>
      </div>
    </div>
  )
}
