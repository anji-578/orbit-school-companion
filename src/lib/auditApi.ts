import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'

export type AuditWrite = {
  action: string
  entityType: string
  entityId?: string | null
  payload?: Record<string, unknown>
}

/** Best-effort audit insert — never throws; failures are silent so mutations stay primary. */
export async function writeAuditLog(input: AuditWrite): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('audit_log').insert({
    school_id: schoolId,
    actor_id: user?.id ?? null,
    action: input.action.slice(0, 80),
    entity_type: input.entityType.slice(0, 64),
    entity_id: input.entityId ? String(input.entityId).slice(0, 64) : null,
    payload: input.payload ?? {},
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export type AuditRow = {
  id: string
  action: string
  entityType: string
  entityId: string | null
  payload: Record<string, unknown>
  createdAt: string
  actorId: string | null
}

export async function fetchAuditLog(limit = 50): Promise<AuditRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('audit_log')
    .select('id, action, entity_type, entity_id, payload, created_at, actor_id')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id as string,
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: (row.entity_id as string | null) ?? null,
    payload: (row.payload as Record<string, unknown>) || {},
    createdAt: row.created_at as string,
    actorId: (row.actor_id as string | null) ?? null,
  }))
}
