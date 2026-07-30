import { Bell, Languages, Smartphone } from 'lucide-react'
import { languagesList, translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import type { Lang, Role } from '../../types'
import { getRoleMeta } from './Sidebar'

export function Header() {
  const role = useOrbitStore((s) => s.role)
  const lang = useOrbitStore((s) => s.lang)
  const notifOpen = useOrbitStore((s) => s.notifOpen)
  const notifications = useOrbitStore((s) => s.notifications)
  const mobileSimulator = useOrbitStore((s) => s.mobileSimulator)
  const setRole = useOrbitStore((s) => s.setRole)
  const setLang = useOrbitStore((s) => s.setLang)
  const setNotifOpen = useOrbitStore((s) => s.setNotifOpen)
  const setMobileSimulator = useOrbitStore((s) => s.setMobileSimulator)
  const markAllNotificationsRead = useOrbitStore((s) => s.markAllNotificationsRead)
  const markNotificationRead = useOrbitStore((s) => s.markNotificationRead)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const t = (key: string) => translate(lang, key)

  const visible = notifications.filter((n) => n.role === 'all' || n.role === role)
  const unread = visible.filter((n) => n.unread).length

  return (
    <header className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-white/10 bg-[#060913]/85 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-3 pl-12 md:pl-0">
        <div className="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/10" role="tablist" aria-label="Persona">
          {(['student', 'parent', 'teacher', 'school'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition ${
                role === r ? 'bg-[var(--accent)] text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t(getRoleMeta(r).labelKey)}
            </button>
          ))}
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/25">
          {t('demoMode')}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
          <Languages className="h-3.5 w-3.5 text-[#4DA6FF]" aria-hidden />
          <span className="sr-only">Language</span>
          <select
            value={lang}
            onChange={(e) => {
              const next = e.target.value as Lang
              setLang(next)
              triggerToast(`Language · ${languagesList.find((l) => l.code === next)?.label}`)
            }}
            className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
          >
            {languagesList.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#0D1120] text-white">
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <div className="relative">
          <button
            type="button"
            aria-label={t('notifications')}
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white transition"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-[var(--accent)] text-[9px] font-black text-black flex items-center justify-center">
                {unread}
              </span>
            ) : null}
          </button>
          {notifOpen ? (
            <div
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#0D1120] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              role="dialog"
              aria-label={t('notifications')}
            >
              <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
                <span className="text-xs font-bold text-white">{t('notifications')}</span>
                <button type="button" onClick={markAllNotificationsRead} className="text-[10px] text-[#4DA6FF] font-bold">
                  {t('markAllRead')}
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto orbit-scroll">
                {visible.length === 0 ? (
                  <p className="px-4 py-6 text-xs text-slate-400 text-center">{t('noNotifications')}</p>
                ) : (
                  visible.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 ${
                        n.unread ? 'bg-[var(--accent)]/5' : ''
                      }`}
                    >
                      <div className="flex justify-between gap-2">
                        <span className="text-xs font-bold text-white">{n.title}</span>
                        <span className="text-[9px] text-slate-500 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.body}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMobileSimulator(!mobileSimulator)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white transition"
          aria-pressed={mobileSimulator}
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden />
          <span>{mobileSimulator ? t('hidePhone') : t('simulateMobile')}</span>
        </button>
      </div>
    </header>
  )
}
