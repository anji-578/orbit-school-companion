import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'nodejs' }

type NotifyBody = {
  eventType?: string
  title?: string
  body?: string
  role?: string
  smsPhone?: string
  userId?: string
  studentId?: string
}

function cors(res: Response) {
  const headers = new Headers(res.headers)
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return new Response(res.body, { status: res.status, headers })
}

function json(data: unknown, status = 200) {
  return cors(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }))
}

function getAdmin() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function configureWebPush() {
  const publicKey = (process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '').trim()
  const privateKey = (process.env.VAPID_PRIVATE_KEY || '').trim()
  const subject = (process.env.VAPID_SUBJECT || 'mailto:alerts@orbit.app').trim()
  if (!publicKey || !privateKey) return null
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

async function sendMsg91Sms(to: string, message: string) {
  const authKey = (process.env.MSG91_AUTH_KEY || '').trim()
  const sender = (process.env.MSG91_SENDER_ID || 'ORBITA').trim()
  const templateId = (process.env.MSG91_TEMPLATE_ID || '').trim()
  if (!authKey) {
    return { status: 'skipped' as const, error: 'MSG91_AUTH_KEY not set' }
  }

  // Flow API / sendhttp — works once DLT templates are approved
  const params = new URLSearchParams({
    authkey: authKey,
    mobiles: to.replace(/\D/g, ''),
    message,
    sender,
    route: '4',
    country: '91',
  })
  if (templateId) params.set('DLT_TE_ID', templateId)

  const response = await fetch(`https://api.msg91.com/api/sendhttp.php?${params.toString()}`, {
    method: 'GET',
  })
  const text = await response.text()
  if (!response.ok) return { status: 'failed' as const, error: text, providerId: text }
  return { status: 'sent' as const, providerId: text }
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }))
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const admin = getAdmin()
  const authHeader = req.headers.get('Authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  const internalSecret = (process.env.NOTIFY_INTERNAL_SECRET || '').trim()
  const providedSecret = (req.headers.get('x-orbit-notify-secret') || '').trim()

  const secretOk = Boolean(internalSecret && providedSecret && providedSecret === internalSecret)
  let userOk = false
  if (bearer && admin) {
    const { data, error } = await admin.auth.getUser(bearer)
    userOk = Boolean(!error && data.user?.id)
  }
  if (!secretOk && !userOk) {
    return json({ error: 'Unauthorized — sign in or provide notify secret.' }, 401)
  }

  let payload: NotifyBody
  try {
    payload = (await req.json()) as NotifyBody
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const title = (payload.title || 'Orbit').trim()
  const body = (payload.body || '').trim()
  const eventType = (payload.eventType || 'general').trim()
  if (!body) return json({ error: 'body required' }, 400)

  const pushReady = configureWebPush()

  let pushSent = 0
  let pushFailed = 0
  let smsStatus: 'sent' | 'failed' | 'skipped' | 'queued' = 'skipped'
  let smsError: string | undefined

  if (admin) {
    // Persist inbox row (broadcast-style when no userId)
    const studentId = payload.studentId?.trim() || null
    await admin.from('app_notifications').insert({
      user_id: payload.userId || null,
      role: payload.role || null,
      event_type: eventType,
      title,
      body,
      student_id: studentId,
      data: { role: payload.role, studentId },
    })

    let pushQuery = admin.from('push_subscriptions').select('endpoint, p256dh, auth, user_id')
    // Child-scoped: only push to the student profile + linked parents (+ staff for awareness)
    if (studentId) {
      const recipientIds = new Set<string>()
      const { data: student } = await admin.from('students').select('profile_id').eq('id', studentId).maybeSingle()
      if (student?.profile_id) recipientIds.add(student.profile_id as string)
      const { data: parents } = await admin
        .from('parent_links')
        .select('parent_profile_id')
        .eq('student_id', studentId)
      for (const p of parents ?? []) {
        if (p.parent_profile_id) recipientIds.add(p.parent_profile_id as string)
      }
      const { data: staff } = await admin
        .from('profiles')
        .select('id')
        .in('role', ['teacher', 'school'])
        .limit(200)
      for (const s of staff ?? []) {
        if (s.id) recipientIds.add(s.id as string)
      }
      if (recipientIds.size) {
        pushQuery = pushQuery.in('user_id', [...recipientIds])
      }
    }

    const { data: subs } = await pushQuery
    if (pushReady && subs?.length) {
      await Promise.all(
        subs.map(async (sub) => {
          try {
            // Respect preference when possible
            const { data: pref } = await admin
              .from('alert_preferences')
              .select('push_enabled, notify_absent, notify_fees, notify_leave, notify_syllabus')
              .eq('user_id', sub.user_id)
              .maybeSingle()
            if (pref && pref.push_enabled === false) return
            if (pref) {
              if (eventType === 'absent' && pref.notify_absent === false) return
              if (eventType === 'fees' && pref.notify_fees === false) return
              if (eventType === 'leave' && pref.notify_leave === false) return
              if (eventType === 'syllabus' && pref.notify_syllabus === false) return
            }
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              JSON.stringify({ title, body, url: '/', tag: eventType }),
            )
            pushSent += 1
          } catch (err) {
            pushFailed += 1
            const message = err instanceof Error ? err.message : 'push failed'
            if (message.includes('410') || message.includes('404')) {
              await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
            }
          }
        }),
      )
    }

    // SMS fan-out: critical events → all opted-in phones (MSG91 required)
    const critical = eventType === 'absent' || eventType === 'fees' || eventType === 'leave'
    if (critical) {
      const phones = new Set<string>()
      if (payload.smsPhone?.trim()) phones.add(payload.smsPhone.trim())
      const { data: prefs } = await admin
        .from('alert_preferences')
        .select('phone_e164, sms_enabled, notify_absent, notify_fees, notify_leave')
        .eq('sms_enabled', true)
      for (const pref of prefs ?? []) {
        if (!pref.phone_e164) continue
        if (eventType === 'absent' && pref.notify_absent === false) continue
        if (eventType === 'fees' && pref.notify_fees === false) continue
        if (eventType === 'leave' && pref.notify_leave === false) continue
        phones.add(String(pref.phone_e164))
      }

      if (!phones.size) {
        smsStatus = 'skipped'
        smsError = 'No opted-in SMS phones (enable in Alerts + add number + MSG91_AUTH_KEY)'
      } else {
        let anySent = false
        let anyFail = false
        for (const phone of phones) {
          const result = await sendMsg91Sms(phone, `${title}: ${body}`.slice(0, 160))
          if (result.status === 'sent') anySent = true
          if (result.status === 'failed') anyFail = true
          if (result.status === 'skipped') smsError = result.error
          await admin.from('sms_log').insert({
            to_e164: phone,
            event_type: eventType,
            body: `${title}: ${body}`.slice(0, 300),
            status: result.status,
            provider_id: result.providerId ?? null,
            error: result.error ?? null,
            cost_paise: result.status === 'sent' ? 18 : 0,
          })
        }
        smsStatus = anySent ? 'sent' : anyFail ? 'failed' : 'skipped'
      }
    }
  } else if (pushReady) {
    // No service role: cannot look up subscriptions; acknowledge config
    smsStatus = 'skipped'
    smsError = 'SUPABASE_SERVICE_ROLE_KEY missing — push fan-out needs admin client'
  }

  return json({
    ok: true,
    eventType,
    pushSent,
    pushFailed,
    smsStatus,
    smsError,
    configured: {
      vapid: Boolean(pushReady),
      supabaseAdmin: Boolean(admin),
      msg91: Boolean((process.env.MSG91_AUTH_KEY || '').trim()),
    },
  })
}
