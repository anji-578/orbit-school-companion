import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveSchoolId } from './schoolPolicy'
import { resolveLinkedStudentId } from './linkedStudent'
import type { Candidate, FleetBus } from '../types'
import { extracurricularListing } from '../data/demo'

export type BusRouteRow = {
  id: string
  name: string
  routeLabel: string
  driver: string
  phone: string
  capacity: string
  status: 'en_route' | 'at_school' | 'idle' | 'cancelled'
  etaText: string | null
  lastUpdatedAt: string
  active: boolean
}

export type ExtraProgram = {
  id: string
  category: string
  title: string
  coach: string
  loc: string
  cost: string
  phone: string
  requestStatus?: string | null
}

export async function fetchBusRoutes(): Promise<BusRouteRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []
  const { data } = await supabase
    .from('bus_routes')
    .select('id, name, route_label, driver_name, driver_phone, capacity, status, eta_text, last_updated_at')
    .eq('school_id', schoolId)
    .order('name')
  if (!data?.length) return []
  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    routeLabel: (row.route_label as string) || '',
    driver: (row.driver_name as string) || '',
    phone: (row.driver_phone as string) || '',
    capacity: (row.capacity as string) || '',
    status: row.status as BusRouteRow['status'],
    etaText: (row.eta_text as string | null) || null,
    lastUpdatedAt: row.last_updated_at as string,
    active: row.status === 'en_route' || row.status === 'at_school',
  }))
}

export async function updateBusRouteStatus(
  id: string,
  status: BusRouteRow['status'],
  etaText?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const { error } = await supabase
    .from('bus_routes')
    .update({
      status,
      eta_text: etaText ?? null,
      last_updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export function busRowsToFleet(rows: BusRouteRow[]): FleetBus[] {
  return rows.map((r) => ({
    id: r.id,
    route: r.routeLabel || r.name,
    driver: r.driver,
    phone: r.phone,
    capacity: r.capacity,
    speed: r.status === 'en_route' ? 32 : 0,
    active: r.active,
    position: r.status === 'at_school' ? 92 : r.status === 'en_route' ? 55 : 8,
  }))
}

export async function fetchHiringApplications(): Promise<Candidate[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []
  const { data } = await supabase
    .from('hiring_applications')
    .select('id, name, subject, experience, qualification, status')
    .eq('school_id', schoolId)
    .order('applied_at', { ascending: false })
  if (!data?.length) return []
  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    subject: row.subject as string,
    experience: (row.experience as string) || '',
    qualification: (row.qualification as string) || '',
    status: (row.status as Candidate['status']) || 'Applied',
  }))
}

export async function scheduleHiringInterview(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const { error } = await supabase
    .from('hiring_applications')
    .update({ status: 'Interview Scheduled', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function fetchExtracurricularPrograms(studentId?: string | null): Promise<ExtraProgram[]> {
  if (!isSupabaseConfigured()) {
    return Object.entries(extracurricularListing).flatMap(([category, items]) =>
      items.map((item, idx) => ({
        id: `local_${category}_${idx}`,
        category,
        title: item.title,
        coach: item.coach,
        loc: item.loc,
        cost: item.cost,
        phone: item.phone,
        requestStatus: null,
      })),
    )
  }
  const supabase = getSupabase()
  if (!supabase) return []
  const schoolId = await resolveSchoolId()
  if (!schoolId) return []

  const childId = studentId ?? (await resolveLinkedStudentId())
  const [{ data: programs }, { data: requests }] = await Promise.all([
    supabase
      .from('extracurricular_programs')
      .select('id, category, title, coach, location, cost_label, phone')
      .eq('school_id', schoolId)
      .eq('active', true),
    childId
      ? supabase
          .from('extracurricular_requests')
          .select('program_id, status')
          .eq('student_id', childId)
      : Promise.resolve({ data: [] as { program_id: string; status: string }[] }),
  ])

  if (!programs?.length) return []
  const statusByProgram = new Map(
    (requests ?? []).map((r) => [r.program_id as string, r.status as string]),
  )
  return programs.map((p) => ({
    id: p.id as string,
    category: p.category as string,
    title: p.title as string,
    coach: (p.coach as string) || '',
    loc: (p.location as string) || '',
    cost: (p.cost_label as string) || '',
    phone: (p.phone as string) || '',
    requestStatus: statusByProgram.get(p.id as string) ?? null,
  }))
}

export async function requestExtracurricularJoin(
  programId: string,
  studentId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: 'Supabase not configured' }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const schoolId = await resolveSchoolId()
  const childId = studentId ?? (await resolveLinkedStudentId())
  if (!schoolId || !childId) return { ok: false, error: 'Link a child first' }

  const { error } = await supabase.from('extracurricular_requests').upsert(
    {
      school_id: schoolId,
      program_id: programId,
      student_id: childId,
      status: 'requested',
    },
    { onConflict: 'program_id,student_id' },
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export function relativeUpdated(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(ms) || ms < 60_000) return 'Just now'
  const mins = Math.floor(ms / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
