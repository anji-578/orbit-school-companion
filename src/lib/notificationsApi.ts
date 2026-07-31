import { getSupabase, isSupabaseConfigured } from './supabase'
import type { NotificationItem, Role } from '../types'

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 60_000) return 'Just now'
  const mins = Math.floor(ms / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export async function fetchAppNotifications(limit = 40): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('app_notifications')
    .select('id, role, title, body, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((row) => ({
    id: Number(row.id),
    role: ((row.role as Role | null) ?? 'all') as NotificationItem['role'],
    title: row.title as string,
    body: row.body as string,
    time: relativeTime(row.created_at as string),
    unread: row.read_at == null,
  }))
}

export async function insertAppNotification(input: {
  title: string
  body: string
  role?: NotificationItem['role']
  eventType: string
  userId?: string | null
}): Promise<number | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null
  const role = input.role && input.role !== 'all' ? input.role : null
  const { data, error } = await supabase
    .from('app_notifications')
    .insert({
      user_id: input.userId ?? null,
      role,
      event_type: input.eventType,
      title: input.title,
      body: input.body,
      data: { role: input.role ?? 'all' },
    })
    .select('id')
    .maybeSingle()
  if (error || !data) return null
  return Number(data.id)
}

export async function markAppNotificationRead(id: number): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from('app_notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
}

export async function markAllAppNotificationsRead(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) return
  await supabase
    .from('app_notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
    .or(`user_id.eq.${user.id},user_id.is.null`)
}
