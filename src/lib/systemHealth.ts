import { getSupabase, isSupabaseConfigured } from './supabase'
import { getVapidPublicKey } from './alerts'

export type HealthCheckId =
  | 'supabase'
  | 'seed'
  | 'trust'
  | 'alerts'
  | 'syllabus'
  | 'storage'
  | 'vapid'

export type HealthCheck = {
  id: HealthCheckId
  label: string
  ok: boolean
  detail: string
}

/** Client-side probes — confirms SQL migrations + env without service role. */
export async function probeSystemHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  const supabaseOk = isSupabaseConfigured()
  checks.push({
    id: 'supabase',
    label: 'Supabase env',
    ok: supabaseOk,
    detail: supabaseOk ? 'VITE_SUPABASE_URL + anon key set' : 'Missing VITE_SUPABASE_* keys',
  })

  if (!supabaseOk) {
    checks.push(
      { id: 'seed', label: 'Seed (Sunrise)', ok: false, detail: 'Needs Supabase' },
      { id: 'trust', label: 'Trust hardening', ok: false, detail: 'Needs Supabase' },
      { id: 'alerts', label: 'Alerts tables', ok: false, detail: 'Needs Supabase' },
      { id: 'syllabus', label: 'Syllabus state', ok: false, detail: 'Needs Supabase' },
      { id: 'storage', label: 'Notes storage', ok: false, detail: 'Needs Supabase' },
    )
  } else {
    const supabase = getSupabase()!
    const school = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
    checks.push({
      id: 'seed',
      label: 'Seed (Sunrise)',
      ok: Boolean(school.data?.id) && !school.error,
      detail: school.data?.id
        ? 'SUNRISE school row found'
        : school.error?.message || 'Run supabase/seed.sql',
    })

    const invites = await supabase.from('class_invites').select('code').limit(1)
    checks.push({
      id: 'trust',
      label: 'Trust hardening',
      ok: !invites.error,
      detail: invites.error ? `${invites.error.message} — run trust_hardening.sql` : 'class_invites readable',
    })

    const notifs = await supabase.from('app_notifications').select('id').limit(1)
    checks.push({
      id: 'alerts',
      label: 'Alerts tables',
      ok: !notifs.error,
      detail: notifs.error ? `${notifs.error.message} — run alerts.sql` : 'app_notifications readable',
    })

    const syl = await supabase.from('syllabus_state').select('school_id').limit(1)
    checks.push({
      id: 'syllabus',
      label: 'Syllabus state',
      ok: !syl.error,
      detail: syl.error ? `${syl.error.message} — run trust_hardening.sql` : 'syllabus_state readable',
    })

    const { error: bucketErr } = await supabase.storage.from('syllabus-notes').list('', { limit: 1 })
    checks.push({
      id: 'storage',
      label: 'Notes storage',
      ok: !bucketErr,
      detail: bucketErr ? `${bucketErr.message} — run storage.sql` : 'syllabus-notes bucket ready',
    })
  }

  const vapid = Boolean(getVapidPublicKey())
  checks.push({
    id: 'vapid',
    label: 'Web Push VAPID',
    ok: vapid,
    detail: vapid ? 'VITE_VAPID_PUBLIC_KEY set' : 'Add VITE_VAPID_PUBLIC_KEY for push',
  })

  return checks
}

export function healthSummary(checks: HealthCheck[]) {
  const ok = checks.filter((c) => c.ok).length
  return { ok, total: checks.length, allOk: ok === checks.length }
}
