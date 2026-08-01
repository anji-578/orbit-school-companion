import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveLinkedStudentId } from './linkedStudent'
import type { PaymentSubmission, SchoolPaymentSettings } from '../types'

const DEFAULT_SETTINGS: SchoolPaymentSettings = {
  upiId: 'sunrise.school@oksbi',
  accountName: 'Sunrise Public School',
  bankName: 'Demo Bank',
  ifsc: '',
  instructions: 'Pay the exact outstanding amount via UPI, then submit the UTR here. ₹0 gateway fee.',
}

async function defaultSchoolId(): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.from('schools').select('id').eq('code', 'SUNRISE').maybeSingle()
  return (data?.id as string | undefined) ?? null
}

function mapSubmission(row: {
  id: string
  amount_paise: number
  utr: string
  paid_on: string | null
  note: string | null
  payer_name: string | null
  status: string
  created_at: string
  student_id?: string | null
  students?: { display_name?: string } | { display_name?: string }[] | null
}): PaymentSubmission {
  const student = row.students
  const studentName = Array.isArray(student) ? student[0]?.display_name : student?.display_name
  return {
    id: row.id,
    amount: Math.round(Number(row.amount_paise) / 100),
    utr: row.utr,
    paidOn: row.paid_on ?? '',
    note: row.note ?? '',
    payerName: row.payer_name ?? '',
    status: row.status as PaymentSubmission['status'],
    createdAt: row.created_at,
    studentId: row.student_id ?? null,
    studentName: studentName ?? null,
  }
}

export async function fetchSchoolPaymentSettings(): Promise<SchoolPaymentSettings> {
  if (!isSupabaseConfigured()) return DEFAULT_SETTINGS
  const supabase = getSupabase()
  if (!supabase) return DEFAULT_SETTINGS
  const schoolId = await defaultSchoolId()
  if (!schoolId) return DEFAULT_SETTINGS
  const { data } = await supabase
    .from('school_payment_settings')
    .select('upi_id, account_name, bank_name, ifsc, instructions')
    .eq('school_id', schoolId)
    .maybeSingle()
  if (!data) return DEFAULT_SETTINGS
  return {
    upiId: (data.upi_id as string) || DEFAULT_SETTINGS.upiId,
    accountName: (data.account_name as string) || DEFAULT_SETTINGS.accountName,
    bankName: (data.bank_name as string) || '',
    ifsc: (data.ifsc as string) || '',
    instructions: (data.instructions as string) || DEFAULT_SETTINGS.instructions,
  }
}

export async function saveSchoolPaymentSettings(settings: SchoolPaymentSettings): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured — payment settings were not saved to the server.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const schoolId = await defaultSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found in Supabase.' }
  const { error } = await supabase.from('school_payment_settings').upsert({
    school_id: schoolId,
    upi_id: settings.upiId,
    account_name: settings.accountName,
    bank_name: settings.bankName || null,
    ifsc: settings.ifsc || null,
    instructions: settings.instructions || null,
    updated_at: new Date().toISOString(),
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function fetchPaymentSubmissions(): Promise<PaymentSubmission[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('payment_submissions')
    .select('id, amount_paise, utr, paid_on, note, payer_name, status, created_at, student_id, students(display_name)')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error || !data) return []
  return data.map((row) =>
    mapSubmission({
      id: row.id as string,
      amount_paise: Number(row.amount_paise),
      utr: row.utr as string,
      paid_on: (row.paid_on as string) ?? null,
      note: (row.note as string) ?? null,
      payer_name: (row.payer_name as string) ?? null,
      status: row.status as string,
      created_at: row.created_at as string,
      student_id: (row.student_id as string) ?? null,
      students: row.students as { display_name?: string } | { display_name?: string }[] | null,
    }),
  )
}

export async function createPaymentSubmission(input: {
  amount: number
  utr: string
  paidOn: string
  note: string
  payerName: string
  userId?: string
}): Promise<{ ok: true; submission: PaymentSubmission } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: 'Connect Supabase to submit UTR payments. Local fake receipts are disabled.',
    }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const schoolId = await defaultSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found. Ask admin to finish school setup.' }

  const studentId = await resolveLinkedStudentId()

  const { data, error } = await supabase
    .from('payment_submissions')
    .insert({
      school_id: schoolId,
      submitted_by: input.userId ?? null,
      student_id: studentId,
      payer_name: input.payerName,
      amount_paise: Math.round(input.amount * 100),
      utr: input.utr.trim(),
      paid_on: input.paidOn || null,
      note: input.note || null,
      status: 'Pending',
    })
    .select('id, amount_paise, utr, paid_on, note, payer_name, status, created_at, student_id, students(display_name)')
    .single()

  if (error || !data) {
    return {
      ok: false,
      error: error?.message || 'Could not save UTR. Check you are signed in as parent and try again.',
    }
  }

  return {
    ok: true,
    submission: mapSubmission({
      id: data.id as string,
      amount_paise: Number(data.amount_paise),
      utr: data.utr as string,
      paid_on: (data.paid_on as string) ?? null,
      note: (data.note as string) ?? null,
      payer_name: (data.payer_name as string) ?? null,
      status: data.status as string,
      created_at: data.created_at as string,
      student_id: (data.student_id as string) ?? null,
      students: data.students as { display_name?: string } | null,
    }),
  }
}

export async function reviewPaymentSubmission(
  id: string,
  status: 'Verified' | 'Rejected',
  reviewerId?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (id.startsWith('local_')) {
    return { ok: false, error: 'This was a local draft receipt and cannot be verified on the server.' }
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured — verification was not saved.' }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase client unavailable.' }
  const { error } = await supabase
    .from('payment_submissions')
    .update({
      status,
      reviewed_by: reviewerId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
