import { Compass } from 'lucide-react'
import { getRoleMeta } from '../../components/layout/Sidebar'
import { languagesList, translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import type { Lang, Role } from '../../types'
import { useAuthStore } from '../../auth/authStore'

const PROFILES: Role[] = ['student', 'parent', 'teacher', 'school']

export function LandingPage() {
  const lang = useOrbitStore((s) => s.lang)
  const setLang = useOrbitStore((s) => s.setLang)
  const setPendingRole = useAuthStore((s) => s.setPendingRole)
  const t = (key: string) => translate(lang, key)

  return (
    <div className="orbit-root min-h-dvh w-full overflow-y-auto orbit-scroll">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#7C6CFF] to-[#4DA6FF] flex items-center justify-center shadow-lg">
              <Compass className="h-5 w-5 text-white animate-spin-slow" aria-hidden />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">{t('orbit')}</h1>
              <p className="text-xs text-[#4DA6FF] font-bold uppercase tracking-wider">{t('tagline')}</p>
            </div>
          </div>

          <label className="self-start sm:self-auto flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('language')}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none"
            >
              {languagesList.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0D1120]">
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <section className="space-y-3 fade-up">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('chooseProfile')}</p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white max-w-xl">{t('landingHeadline')}</h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">{t('landingSub')}</p>
        </section>

        <section className="grid sm:grid-cols-2 gap-4" aria-label={t('chooseProfile')}>
          {PROFILES.map((role, idx) => {
            const meta = getRoleMeta(role)
            const Icon = meta.icon
            return (
              <button
                key={role}
                type="button"
                onClick={() => setPendingRole(role)}
                className="glass glass-hover rounded-3xl p-5 sm:p-6 text-left min-h-[150px] flex flex-col justify-between border border-white/10 fade-up"
                style={{
                  animationDelay: `${idx * 0.05}s`,
                  ['--accent' as string]: meta.accent,
                  ['--accent2' as string]: meta.accent2,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent2})` }}
                  >
                    <Icon className="h-6 w-6 text-[#05070f]" aria-hidden />
                  </div>
                  <span className="text-2xl" aria-hidden>
                    {meta.emoji}
                  </span>
                </div>
                <div className="space-y-1 mt-4">
                  <h3 className="text-base font-extrabold text-white">{t(meta.labelKey)}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{t(`${role}LandingDesc`)}</p>
                  <span className="inline-block mt-2 text-[11px] font-bold" style={{ color: meta.accent }}>
                    {t('continueToLogin')} →
                  </span>
                </div>
              </button>
            )
          })}
        </section>

        <p className="text-center text-[10px] text-slate-500 pb-6">{t('landingFooter')}</p>
      </div>
    </div>
  )
}
