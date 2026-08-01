import { useEffect, useState } from 'react'
import { BellRing, MessageSquare, Smartphone } from 'lucide-react'
import {
  disableWebPush,
  enableWebPush,
  fetchAlertPreferences,
  getVapidPublicKey,
  registerOrbitServiceWorker,
  saveAlertPreferences,
  type AlertPreferences,
} from '../../lib/alerts'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card } from '../../components/ui/primitives'

export function AlertsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const t = (key: string) => translate(lang, key)

  const [prefs, setPrefs] = useState<AlertPreferences | null>(null)
  const [busy, setBusy] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  )
  const vapidReady = Boolean(getVapidPublicKey())
  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    void registerOrbitServiceWorker()
    void fetchAlertPreferences().then(setPrefs)
  }, [])

  const refresh = async () => {
    setPrefs(await fetchAlertPreferences())
    if (typeof Notification !== 'undefined') setPermission(Notification.permission)
  }

  const onEnablePush = async () => {
    setBusy(true)
    const result = await enableWebPush()
    setBusy(false)
    await refresh()
    triggerToast(result.ok ? t('pushEnabledToast') : result.error || t('pushFailedToast'))
  }

  const onDisablePush = async () => {
    setBusy(true)
    await disableWebPush()
    setBusy(false)
    await refresh()
    triggerToast(t('pushDisabledToast'))
  }

  const patch = async (next: Partial<AlertPreferences>) => {
    setBusy(true)
    const result = await saveAlertPreferences(next)
    setBusy(false)
    if (!result.ok) {
      triggerToast(result.error || t('prefsSaveFailed'))
      return
    }
    await refresh()
    triggerToast(t('prefsSaved'))
  }

  if (!prefs) {
    return (
      <Panel title={t('alertsTitle')} subtitle={t('alertsSubtitle')}>
        <p className="text-xs text-slate-400">{t('loadingAlerts')}</p>
      </Panel>
    )
  }

  return (
    <Panel title={t('alertsTitle')} subtitle={t('alertsSubtitle')}>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold">
            <Smartphone className="h-4 w-4 text-[var(--accent2)]" aria-hidden />
            {t('webPushTitle')}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{t('webPushDesc')}</p>
          <p className="text-[10px] text-slate-500">
            {t('permission')}: <span className="text-slate-300 font-semibold">{permission}</span>
            {!vapidReady ? ` · ${t('vapidMissing')}` : ''}
            {!supabaseReady ? ` · ${t('supabaseOptionalPush')}` : ''}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={busy || !vapidReady}
              onClick={() => void onEnablePush()}
              className="btn-accent px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50"
            >
              <BellRing className="h-3 w-3 inline mr-1" aria-hidden />
              {t('enablePush')}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onDisablePush()}
              className="btn-ghost px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
            >
              {t('disablePush')}
            </button>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-white text-xs font-bold">
            <MessageSquare className="h-4 w-4 text-[var(--accent2)]" aria-hidden />
            {t('smsTitle')}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{t('smsDesc')}</p>
          <label className="flex items-center gap-2 text-[11px] text-slate-300">
            <input
              type="checkbox"
              checked={prefs.sms_enabled}
              disabled={busy}
              onChange={(e) => void patch({ sms_enabled: e.target.checked })}
            />
            {t('smsOptIn')}
          </label>
          <input
            type="tel"
            value={prefs.phone_e164 ?? ''}
            disabled={busy || !prefs.sms_enabled}
            onChange={(e) => setPrefs({ ...prefs, phone_e164: e.target.value })}
            onBlur={() => void patch({ phone_e164: prefs.phone_e164 })}
            placeholder="+91 98XXXXXX00"
            className="field w-full rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-[10px] text-slate-500">{t('smsDltNote')}</p>
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('eventToggles')}</p>
        {(
          [
            ['notify_absent', 'notifyAbsent'],
            ['notify_fees', 'notifyFees'],
            ['notify_leave', 'notifyLeave'],
            ['notify_syllabus', 'notifySyllabus'],
          ] as const
        ).map(([key, labelKey]) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-slate-200"
          >
            <span>{t(labelKey)}</span>
            <input
              type="checkbox"
              checked={prefs[key]}
              disabled={busy}
              onChange={(e) => void patch({ [key]: e.target.checked })}
            />
          </label>
        ))}
      </div>
    </Panel>
  )
}
