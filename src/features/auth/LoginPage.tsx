import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { getRoleMeta } from '../../components/layout/Sidebar'
import { OrbitLogo } from '../../components/brand/OrbitLogo'
import { OrbitMark } from '../../components/brand/OrbitMark'
import { ThemeToggle } from '../../components/brand/ThemeToggle'
import { translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import type { Role } from '../../types'
import { useAuthStore } from '../../auth/authStore'
import { demoHintForRole } from '../../auth/demoUsers'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'

type Mode = 'signin' | 'signup'

export function LoginPage({ role }: { role: Role }) {
  const lang = useOrbitStore((s) => s.lang)
  const setRole = useOrbitStore((s) => s.setRole)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const login = useAuthStore((s) => s.login)
  const signup = useAuthStore((s) => s.signup)
  const authError = useAuthStore((s) => s.authError)
  const authNotice = useAuthStore((s) => s.authNotice)
  const setPendingRole = useAuthStore((s) => s.setPendingRole)
  const clearAuthError = useAuthStore((s) => s.clearAuthError)
  const clearAuthNotice = useAuthStore((s) => s.clearAuthNotice)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const hint = demoHintForRole(role)
  const [mode, setMode] = useState<Mode>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const meta = getRoleMeta(role)
  const Icon = meta.icon
  const t = (key: string) => translate(lang, key)
  const usingSupabase = isSupabaseConfigured()

  const switchMode = (next: Mode) => {
    setMode(next)
    clearAuthError()
    clearAuthNotice()
    setPassword('')
    setConfirmPassword('')
    if (next === 'signin') setEmail((e) => e || hint.email)
  }

  const enterApp = (toastKey: string) => {
    setRole(role)
    setActiveTab('dashboard')
    triggerToast(`${t(toastKey)} · ${meta.emoji}`)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearAuthError()
    clearAuthNotice()

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        useAuthStore.setState({ authError: t('passwordMismatch') })
        return
      }
      setLoading(true)
      const result = await signup(role, { email, password, displayName })
      setLoading(false)
      if (result === 'signed_in') {
        enterApp('accountCreated')
        return
      }
      if (result === 'needs_confirmation') {
        setMode('signin')
        triggerToast(t('signupConfirmToast'))
      }
      return
    }

    setLoading(true)
    const ok = await login(role, email, password)
    setLoading(false)
    if (ok) enterApp('welcomeBack')
  }

  return (
    <div
      className="orbit-root min-h-dvh w-full flex items-center justify-center p-4 sm:p-8"
      style={{ ['--accent' as string]: meta.accent, ['--accent2' as string]: meta.accent2 }}
    >
      <div className="w-full max-w-md space-y-5 fade-up">
        <div className="flex items-center justify-between gap-3">
          <OrbitLogo variant="lockup" showTagline={false} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                setPendingRole(null)
                clearAuthError()
                clearAuthNotice()
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {t('backToProfiles')}
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent2})` }}
            >
              <Icon className="h-6 w-6 text-[#05070f]" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {mode === 'signup' ? t('createAccountAs') : t('signInAs')}
              </p>
              <h1 className="font-display text-xl font-bold text-white">{t(meta.labelKey)}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-lg text-[11px] font-bold transition ${
                mode === 'signin' ? 'bg-[var(--accent)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg text-[11px] font-bold transition ${
                mode === 'signup' ? 'bg-[var(--accent)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('signUp')}
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' ? (
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('fullName')}</span>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="field w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
                    placeholder={t('fullNamePlaceholder')}
                  />
                </div>
              </label>
            ) : null}

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
                  placeholder={mode === 'signin' ? hint.email : 'you@school.edu'}
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('password')}</span>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
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

            {mode === 'signup' ? (
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('confirmPassword')}</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="field w-full rounded-xl pl-10 pr-3 py-2.5 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </label>
            ) : null}

            {authError ? (
              <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2" role="alert">
                {authError}
              </p>
            ) : null}

            {authNotice && !authError ? (
              <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2" role="status">
                {authNotice}
              </p>
            ) : null}

            <button type="submit" disabled={loading} className="btn-accent w-full rounded-xl py-3 text-sm font-bold">
              {loading
                ? mode === 'signup'
                  ? t('creatingAccount')
                  : t('signingIn')
                : mode === 'signup'
                  ? t('createAccount')
                  : t('signIn')}
            </button>
          </form>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-300/90">
              {usingSupabase ? t('credentialsStoredIn') : t('demoCredentials')}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {usingSupabase ? t('credentialsStoredHint') : `${hint.email} / ${hint.password}`}
            </p>
            {!usingSupabase ? <p className="text-[10px] text-slate-500">{t('demoCredentialsHint')}</p> : null}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px]">
          <OrbitMark className="h-4 w-4" />
          <span>{usingSupabase ? 'Orbit · Supabase Auth' : 'Orbit · local accounts'}</span>
        </div>
      </div>
    </div>
  )
}
