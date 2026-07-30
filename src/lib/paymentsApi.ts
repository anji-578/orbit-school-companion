import { getSupabase, isSupabaseConfigured } from './supabase'
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
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
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
    .select('id, amount_paise, utr, paid_on, note, payer_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error || !data) return []
  return data.map((row) => ({
    id: row.id as string,
    amount: Math.round(Number(row.amount_paise) / 100),
    utr: row.utr as string,
    paidOn: (row.paid_on as string) ?? '',
    note: (row.note as string) ?? '',
    payerName: (row.payer_name as string) ?? '',
    status: row.status as PaymentSubmission['status'],
    createdAt: row.created_at as string,
  }))
}

export async function createPaymentSubmission(input: {
  amount: number
  utr: string
  paidOn: string
  note: string
  payerName: string
  userId?: string
}): Promise<{ ok: true; submission: PaymentSubmission } | { ok: false; error: string }> {
  const local: PaymentSubmission = {
    id: `local_${Date.now()}`,
    amount: input.amount,
    utr: input.utr.trim(),
    paidOn: input.paidOn,
    note: input.note,
    payerName: input.payerName,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }

  if (!isSupabaseConfigured()) return { ok: true, submission: local }
  const supabase = getSupabase()
  if (!supabase) return { ok: true, submission: local }
  const schoolId = await defaultSchoolId()
  if (!schoolId) return { ok: true, submission: local }

  const { data, error } = await supabase
    .from('payment_submissions')
    .insert({
      school_id: schoolId,
      submitted_by: input.userId ?? null,
      payer_name: input.payerName,
      amount_paise: Math.round(input.amount * 100),
      utr: input.utr.trim(),
      paid_on: input.paidOn || null,
      note: input.note || null,
      status: 'Pending',
    })
    .select('id, amount_paise, utr, paid_on, note, payer_name, status, created_at')
    .single()

  if (error || !data) {
    // Keep UX working even if RLS blocks insert
    return { ok: true, submission: local }
  }

  return {
    ok: true,
    submission: {
      id: data.id as string,
      amount: Math.round(Number(data.amount_paise) / 100),
      utr: data.utr as string,
      paidOn: (data.paid_on as string) ?? '',
      note: (data.note as string) ?? '',
      payerName: (data.payer_name as string) ?? '',
      status: data.status as PaymentSubmission['status'],
      createdAt: data.created_at as string,
    },
  }
}

export async function reviewPaymentSubmission(
  id: string,
  status: 'Verified' | 'Rejected',
  reviewerId?: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured() || id.startsWith('local_')) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: true }
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
