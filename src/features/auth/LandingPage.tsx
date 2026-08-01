import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Bus,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  School,
  Users,
} from 'lucide-react'
import { languagesList, translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import type { Lang, Role } from '../../types'
import { useAuthStore } from '../../auth/authStore'
import { getRoleMeta } from '../../components/layout/Sidebar'
import { OrbitLogo } from '../../components/brand/OrbitLogo'
import { ThemeToggle } from '../../components/brand/ThemeToggle'

const PROFILES: Role[] = ['student', 'parent', 'teacher', 'school']

const FEATURES = [
  {
    id: 'alerts',
    icon: BellRing,
    accent: '#5B8CFF',
    titleKey: 'landingFeatAlertsTitle',
    bodyKey: 'landingFeatAlertsBody',
  },
  {
    id: 'progress',
    icon: CheckCircle2,
    accent: '#2DD4BF',
    titleKey: 'landingFeatProgressTitle',
    bodyKey: 'landingFeatProgressBody',
  },
  {
    id: 'calendar',
    icon: CalendarDays,
    accent: '#FFB454',
    titleKey: 'landingFeatCalendarTitle',
    bodyKey: 'landingFeatCalendarBody',
  },
  {
    id: 'fees',
    icon: CreditCard,
    accent: '#7C9CFF',
    titleKey: 'landingFeatFeesTitle',
    bodyKey: 'landingFeatFeesBody',
  },
] as const

type FeatureId = (typeof FEATURES)[number]['id']

function PersonaStrip({
  onPick,
  t,
}: {
  onPick: (role: Role) => void
  t: (key: string) => string
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label={t('chooseProfile')}>
      {PROFILES.map((role, idx) => {
        const meta = getRoleMeta(role)
        const Icon = meta.icon
        return (
          <button
            key={role}
            type="button"
            onClick={() => onPick(role)}
            className="landing-persona group text-left rounded-3xl p-4 sm:p-5 border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition duration-300"
            style={{
              animationDelay: `${0.08 + idx * 0.05}s`,
              ['--persona' as string]: meta.accent,
            }}
          >
            <div
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(145deg, ${meta.accent}, ${meta.accent2})`,
                boxShadow: `0 12px 28px -12px ${meta.accent}`,
              }}
            >
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-[#05070f]" aria-hidden />
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white">{t(meta.labelKey)}</p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">{t(`${role}LandingDesc`)}</p>
            <span
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold"
              style={{ color: meta.accent }}
            >
              {t('getStartedAs')}
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FeatureVisual({ id }: { id: FeatureId }) {
  if (id === 'alerts') {
    return (
      <div className="relative h-64 sm:h-72">
        <div className="absolute left-2 top-6 right-8 landing-float rounded-2xl bg-[#1a2744] border border-white/10 p-3.5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3.5 w-3.5 text-teal-300" aria-hidden />
            <p className="text-[10px] font-bold text-slate-300">Parent · Ananya</p>
          </div>
          <p className="text-xs text-white leading-snug">Homework for Math is due tomorrow — Algebra worksheet.</p>
          <p className="text-[9px] text-slate-500 mt-2">Just now</p>
        </div>
        <div className="absolute left-10 top-28 right-2 landing-float-delay rounded-2xl bg-[#243456] border border-sky-400/20 p-3.5 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            <p className="text-[10px] font-bold text-slate-300">Teacher · Class 8-A</p>
          </div>
          <p className="text-xs text-white leading-snug">Attendance marked. 2 absentees notified to parents.</p>
          <p className="text-[9px] text-emerald-400/80 mt-2">Synced across roles</p>
        </div>
        <div className="absolute -right-1 top-2 h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center landing-pulse">
          <BellRing className="h-4 w-4 text-sky-300" aria-hidden />
        </div>
      </div>
    )
  }

  if (id === 'progress') {
    return (
      <div className="relative h-64 sm:h-72">
        <div className="absolute inset-x-4 top-4 landing-float rounded-3xl bg-gradient-to-br from-teal-500/15 to-sky-500/10 border border-white/10 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-300/80">Study score</p>
          <p className="font-display text-5xl font-bold text-white mt-1">86</p>
          <p className="text-[11px] text-slate-400 mt-1">Attendance 92% · Homework 78%</p>
          <div className="mt-4 grid grid-cols-5 gap-1.5">
            {['P', 'P', 'P', 'A', 'P'].map((s, i) => (
              <div
                key={i}
                className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  s === 'P' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute right-2 bottom-4 landing-float-delay rounded-2xl bg-[#151c2e] border border-white/10 px-3 py-2 flex items-center gap-2">
          <Bus className="h-4 w-4 text-teal-300" aria-hidden />
          <div>
            <p className="text-[10px] font-bold text-white">Bus 12 · On route</p>
            <p className="text-[9px] text-slate-400">ETA 8 mins</p>
          </div>
        </div>
      </div>
    )
  }

  if (id === 'calendar') {
    return (
      <div className="relative h-64 sm:h-72">
        <div className="absolute left-2 top-6 w-[58%] landing-float rounded-2xl bg-[#151c2e] border border-white/10 p-3.5 shadow-xl">
          <p className="text-[10px] font-black uppercase text-amber-300/80">Today · Mon</p>
          <div className="mt-2 space-y-2">
            {[
              ['8:30', 'Math'],
              ['9:20', 'Science'],
              ['10:10', 'Chem Lab'],
            ].map(([time, sub]) => (
              <div key={time} className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-500 w-10">{time}</span>
                <span className="flex-1 rounded-lg bg-white/5 px-2 py-1.5 font-bold text-white">{sub}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute right-2 top-16 w-[48%] landing-float-delay rounded-2xl bg-[#1a2744] border border-white/10 p-3 shadow-xl">
          <p className="text-[10px] font-bold text-white">Unit Test 2</p>
          <p className="text-[9px] text-slate-400 mt-1">Math & Science · Aug 12</p>
        </div>
        <div className="absolute right-6 bottom-8 w-[42%] landing-float rounded-2xl bg-[#243456] border border-amber-400/20 p-3 shadow-xl">
          <p className="text-[10px] font-bold text-white">Sports Day</p>
          <p className="text-[9px] text-slate-400 mt-1">Whole school · Friday</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-64 sm:h-72">
      <div className="absolute inset-x-3 top-5 landing-float rounded-3xl bg-[#151c2e] border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-white">Fee ledger · Grade 8-A</p>
          <School className="h-4 w-4 text-indigo-300" aria-hidden />
        </div>
        {[
          ['Ananya Rao', '₹4,500', 'Pending'],
          ['Sarah Chen', '₹0', 'Cleared'],
          ['Marcus J.', '₹2,200', 'Unpaid'],
        ].map(([name, amt, status]) => (
          <div key={name} className="flex items-center justify-between py-2 border-t border-white/5">
            <span className="text-[11px] text-slate-300">{name}</span>
            <div className="text-right">
              <p className="text-[11px] font-bold text-white">{amt}</p>
              <p
                className={`text-[9px] font-bold ${
                  status === 'Cleared' ? 'text-emerald-400' : status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LandingPage() {
  const lang = useOrbitStore((s) => s.lang)
  const setLang = useOrbitStore((s) => s.setLang)
  const setPendingRole = useAuthStore((s) => s.setPendingRole)
  const [activeFeature, setActiveFeature] = useState<FeatureId>('alerts')
  const t = (key: string) => translate(lang, key)

  const active = useMemo(() => FEATURES.find((f) => f.id === activeFeature) ?? FEATURES[0], [activeFeature])
  const ActiveIcon = active.icon

  const scrollToStart = () => {
    document.getElementById('orbit-get-started')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="orbit-root fixed inset-0 overflow-y-auto orbit-scroll">
      <div className="min-h-full">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-[color-mix(in_srgb,var(--bg-base)_78%,transparent)] border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            <OrbitLogo variant="lockup" showTagline={false} />
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <label className="hidden sm:flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
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
              <button
                type="button"
                onClick={scrollToStart}
                className="btn-accent px-3.5 py-2 rounded-full text-[11px] font-bold"
              >
                {t('landingSignIn')}
              </button>
            </div>
          </div>
        </header>

        {/* Hero — brand + one headline + personas */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-16">
          <div className="landing-hero-glow pointer-events-none absolute inset-x-0 -top-10 h-72 opacity-70" aria-hidden />
          <div className="relative text-center space-y-5 fade-up">
            <OrbitLogo variant="hero" className="mx-auto" />
            <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight max-w-3xl mx-auto leading-[1.1]">
              {t('landingHeroTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t('landingHeroSub')}
            </p>
          </div>

          <div id="orbit-get-started" className="mt-10 sm:mt-14 scroll-mt-24">
            <p className="text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 fade-up">
              {t('getStartedAs')}
            </p>
            <PersonaStrip onPick={setPendingRole} t={t} />
          </div>
        </section>

        {/* Interactive feature journey */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{t('landingTourEyebrow')}</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">{t('landingTourTitle')}</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">{t('landingTourSub')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label={t('landingTourTitle')}>
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              const on = feat.id === activeFeature
              return (
                <button
                  key={feat.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveFeature(feat.id)}
                  className={`landing-feat-tab ${on ? 'is-active' : ''}`}
                  style={{ ['--feat-accent' as string]: feat.accent }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>{t(feat.titleKey)}</span>
                </button>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center landing-story-panel rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <div
              className="rounded-[1.5rem] border border-white/10 bg-[color-mix(in_srgb,var(--bg-base)_55%,transparent)] p-3 sm:p-4 overflow-hidden"
              style={{ boxShadow: `inset 0 0 60px color-mix(in srgb, ${active.accent} 12%, transparent)` }}
            >
              <FeatureVisual id={activeFeature} />
            </div>
            <div className="space-y-4">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${active.accent} 22%, transparent)` }}
              >
                <ActiveIcon className="h-5 w-5" style={{ color: active.accent }} aria-hidden />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                {t(active.titleKey)}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-400 leading-relaxed">{t(active.bodyKey)}</p>
              <button
                type="button"
                onClick={scrollToStart}
                className="inline-flex items-center gap-2 text-sm font-bold"
                style={{ color: active.accent }}
              >
                {t('landingTryIt')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Role highlight strip */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PROFILES.map((role) => {
              const meta = getRoleMeta(role)
              const Icon = meta.icon
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setPendingRole(role)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:border-white/20 transition group"
                >
                  <Icon className="h-5 w-5 mb-2" style={{ color: meta.accent }} aria-hidden />
                  <p className="text-xs font-extrabold text-white">{t(meta.labelKey)}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">{t(`landingRoleHighlight_${role}`)}</p>
                  <span className="mt-2 inline-flex text-[10px] font-bold opacity-70 group-hover:opacity-100" style={{ color: meta.accent }}>
                    {t('continueToLogin')} →
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <footer className="border-t border-white/5 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <OrbitLogo variant="mark" markClassName="h-8 w-8" />
              <p className="text-xs text-slate-500">{t('landingFooter')}</p>
            </div>
            <button
              type="button"
              onClick={scrollToStart}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"
            >
              <GraduationCap className="h-4 w-4" aria-hidden />
              {t('getStartedAs')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
