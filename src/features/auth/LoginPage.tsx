import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Compass, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { getRoleMeta } from '../../components/layout/Sidebar'
import { translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import type { Role } from '../../types'
import { useAuthStore } from '../../auth/authStore'
import { demoHintForRole } from '../../auth/demoUsers'

export function LoginPage({ role }: { role: Role }) {
  const lang = useOrbitStore((s) => s.lang)
  const setRole = useOrbitStore((s) => s.setRole)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const login = useAuthStore((s) => s.login)
  const authError = useAuthStore((s) => s.authError)
  const setPendingRole = useAuthStore((s) => s.setPendingRole)
  const clearAuthError = useAuthStore((s) => s.clearAuthError)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const hint = demoHintForRole(role)
  const [email, setEmail] = useState(hint.email)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const meta = getRoleMeta(role)
  const Icon = meta.icon
  const t = (key: string) => translate(lang, key)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearAuthError()
    setLoading(true)
    const ok = await login(role, email, password)
    setLoading(false)
    if (ok) {
      setRole(role)
      setActiveTab('dashboard')
      triggerToast(`${t('welcomeBack')} · ${meta.emoji}`)
    }
  }

  return (
    <div
      className="orbit-root min-h-dvh w-full flex items-center justify-center p-4 sm:p-8"
      style={{ ['--accent' as string]: meta.accent, ['--accent2' as string]: meta.accent2 }}
    >
      <div className="w-full max-w-md space-y-5 fade-up">
        <button
          type="button"
          onClick={() => {
            setPendingRole(null)
            clearAuthError()
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {t('backToProfiles')}
        </button>

        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent2})` }}
            >
              <Icon className="h-6 w-6 text-[#05070f]" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('signInAs')}</p>
              <h1 className="font-display text-xl font-bold text-white">{t(meta.labelKey)}</h1>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('email')}</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
                  placeholder={hint.email}
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('password')}</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field w-full rounded-xl pl-10 pr-10 py-2.5 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {authError ? (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2" role="alert">
                {authError}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="btn-accent w-full rounded-xl py-3 text-sm font-bold">
              {loading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-300/90">{t('demoCredentials')}</p>
            <p className="text-[11px] text-slate-300 font-mono break-all">
              {hint.email} / {hint.password}
            </p>
            <p className="text-[10px] text-slate-500">{t('demoCredentialsHint')}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px]">
          <Compass className="h-3.5 w-3.5" aria-hidden />
          <span>Orbit · local demo auth · Supabase-ready</span>
        </div>
      </div>
    </div>
  )
}
