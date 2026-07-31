import type { NotificationItem } from '../types'
import { getSupabase, isSupabaseConfigured } from './supabase'

export type AlertEventType = 'absent' | 'fees' | 'leave' | 'syllabus' | 'broadcast' | 'general'

export type AlertPreferences = {
  push_enabled: boolean
  sms_enabled: boolean
  phone_e164: string | null
  notify_absent: boolean
  notify_fees: boolean
  notify_leave: boolean
  notify_syllabus: boolean
}

const DEFAULT_PREFS: AlertPreferences = {
  push_enabled: true,
  sms_enabled: false,
  phone_e164: null,
  notify_absent: true,
  notify_fees: true,
  notify_leave: true,
  notify_syllabus: true,
}

export function getVapidPublicKey() {
  return (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim() || ''
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

export async function registerOrbitServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  } catch {
    return null
  }
}

export async function fetchAlertPreferences(): Promise<AlertPreferences> {
  const supabase = getSupabase()
  if (!supabase) return DEFAULT_PREFS
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return DEFAULT_PREFS

  const { data } = await supabase.from('alert_preferences').select('*').eq('user_id', userId).maybeSingle()
  if (!data) return DEFAULT_PREFS
  return {
    push_enabled: Boolean(data.push_enabled),
    sms_enabled: Boolean(data.sms_enabled),
    phone_e164: (data.phone_e164 as string | null) ?? null,
    notify_absent: data.notify_absent !== false,
    notify_fees: data.notify_fees !== false,
    notify_leave: data.notify_leave !== false,
    notify_syllabus: data.notify_syllabus !== false,
  }
}

export async function saveAlertPreferences(patch: Partial<AlertPreferences>) {
  const supabase = getSupabase()
  if (!supabase) return { ok: false as const, error: 'Supabase not configured' }
  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return { ok: false as const, error: 'Sign in required' }

  const current = await fetchAlertPreferences()
  const next = { ...current, ...patch }
  const { error } = await supabase.from('alert_preferences').upsert({
    user_id: userId,
    push_enabled: next.push_enabled,
    sms_enabled: next.sms_enabled,
    phone_e164: next.phone_e164,
    notify_absent: next.notify_absent,
    notify_fees: next.notify_fees,
    notify_leave: next.notify_leave,
    notify_syllabus: next.notify_syllabus,
    updated_at: new Date().toISOString(),
  })
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function enableWebPush(): Promise<{ ok: boolean; error?: string }> {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, error: 'Push not supported in this browser' }
  }
  const vapid = getVapidPublicKey()
  if (!vapid) return { ok: false, error: 'VITE_VAPID_PUBLIC_KEY missing' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, error: 'Notification permission denied' }

  const reg = (await navigator.serviceWorker.getRegistration()) ?? (await registerOrbitServiceWorker())
  if (!reg) return { ok: false, error: 'Service worker failed' }

  const existing = await reg.pushManager.getSubscription()
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid),
    }))

  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, error: 'Invalid push subscription' }
  }

  const supabase = getSupabase()
  if (!supabase || !isSupabaseConfigured()) {
    // Local-only: still subscribed in browser; server fan-out needs Supabase
    await saveAlertPreferences({ push_enabled: true })
    return { ok: true }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user?.id
  if (!userId) return { ok: false, error: 'Sign in required for sync' }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,endpoint' },
  )
  if (error) return { ok: false, error: error.message }
  await saveAlertPreferences({ push_enabled: true })
  return { ok: true }
}

export async function disableWebPush(): Promise<{ ok: boolean; error?: string }> {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  const endpoint = sub?.endpoint
  if (sub) await sub.unsubscribe()

  const supabase = getSupabase()
  if (supabase && endpoint) {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData.session?.user?.id
    if (userId) {
      await supabase.from('push_subscriptions').delete().eq('user_id', userId).eq('endpoint', endpoint)
    }
  }
  await saveAlertPreferences({ push_enabled: false })
  return { ok: true }
}

/** Fire-and-forget server fan-out (push + optional SMS). Requires auth when Supabase is configured. */
export function dispatchRemoteAlert(input: {
  eventType: AlertEventType
  title: string
  body: string
  role?: NotificationItem['role']
  smsPhone?: string
}) {
  void (async () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    try {
      const supabase = getSupabase()
      if (supabase) {
        const { data } = await supabase.auth.getSession()
        const token = data.session?.access_token
        if (token) headers.Authorization = `Bearer ${token}`
      }
    } catch {
      /* local demo — skip auth header */
    }
    await fetch('/api/notify', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventType: input.eventType,
        title: input.title,
        body: input.body,
        role: input.role ?? 'all',
        smsPhone: input.smsPhone,
      }),
    })
  })().catch(() => {
    /* offline / local — in-app toast already shown */
  })
}

export function eventTypeFromNotification(title: string, body: string): AlertEventType {
  const hay = `${title} ${body}`.toLowerCase()
  if (hay.includes('absent')) return 'absent'
  if (hay.includes('fee') || hay.includes('utr') || hay.includes('payment')) return 'fees'
  if (hay.includes('leave')) return 'leave'
  if (hay.includes('syllabus') || hay.includes('notes')) return 'syllabus'
  if (hay.includes('circular') || hay.includes('broadcast')) return 'broadcast'
  return 'general'
}
