import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BellRing, Check, Save, X } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { groupFeesByStudent } from '../../lib/feesApi'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'

const FEE_STATUS_CLASS: Record<string, string> = {
  Paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Unpaid: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Overdue: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

const SUB_STATUS_CLASS: Record<string, string> = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Verified: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

export function SchoolFees() {
  const lang = useOrbitStore((s) => s.lang)
  const fees = useOrbitStore((s) => s.fees)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const paymentHistory = useOrbitStore((s) => s.paymentHistory)
  const schoolPaymentSettings = useOrbitStore((s) => s.schoolPaymentSettings)
  const paymentSubmissions = useOrbitStore((s) => s.paymentSubmissions)
  const nudgeFeeParents = useOrbitStore((s) => s.nudgeFeeParents)
  const setSchoolPaymentSettings = useOrbitStore((s) => s.setSchoolPaymentSettings)
  const persistSchoolPaymentSettings = useOrbitStore((s) => s.persistSchoolPaymentSettings)
  const loadPaymentWorkspace = useOrbitStore((s) => s.loadPaymentWorkspace)
  const reviewUtrPayment = useOrbitStore((s) => s.reviewUtrPayment)
  const session = useAuthStore((s) => s.session)

  const [saving, setSaving] = useState(false)
  const t = (key: string) => translate(lang, key)
  const collected = paymentHistory.reduce((sum, p) => sum + p.amount, 0)
  const pending = paymentSubmissions.filter((p) => p.status === 'Pending')
  const ledger = useMemo(() => groupFeesByStudent(fees), [fees])
  const familiesWithDues = ledger.filter((g) => g.outstanding > 0).length

  useEffect(() => {
    void loadPaymentWorkspace()
  }, [loadPaymentWorkspace])

  const onSaveSettings = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await persistSchoolPaymentSettings()
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Panel
        title={t('schoolFeeAuditorTitle')}
        subtitle={t('schoolFeeAuditorDesc')}
        action={
          <button
            type="button"
            onClick={nudgeFeeParents}
            className="btn-accent flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
          >
            <BellRing className="h-3.5 w-3.5" aria-hidden />
            {t('nudgeParents')}
          </button>
        }
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <StatTile
            label={t('billingOutstanding')}
            value={outstandingFees > 0 ? `₹${outstandingFees.toLocaleString()}` : '₹0'}
            accent={outstandingFees > 0 ? '#FF6B8B' : '#22C55E'}
          />
          <StatTile label={t('collectedLabel')} value={`₹${collected.toLocaleString()}`} accent="#22C55E" />
          <StatTile label={t('familiesWithDues')} value={String(familiesWithDues)} />
        </div>

        {ledger.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">{t('feeLedgerEmpty')}</p>
        ) : (
          <div className="space-y-4">
            {ledger.map((group) => (
              <Card key={group.studentId} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{group.studentName}</p>
                    <Eyebrow>
                      {group.unpaidCount > 0
                        ? t('childOutstanding')
                            .replace('{count}', String(group.unpaidCount))
                            .replace('{amount}', `₹${group.outstanding.toLocaleString()}`)
                        : t('childFeesCleared')}
                    </Eyebrow>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${
                      group.outstanding > 0
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                    }`}
                  >
                    {group.outstanding > 0 ? `₹${group.outstanding.toLocaleString()}` : t('cleared')}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.fees.map((fee) => (
                    <div
                      key={fee.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{fee.name}</p>
                        <p className="text-[10px] text-slate-400">{fee.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-white">₹{fee.amount.toLocaleString()}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${FEE_STATUS_CLASS[fee.status]}`}
                        >
                          {fee.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Panel>

      <Panel title={t('schoolPaymentSettingsTitle')} subtitle={t('schoolPaymentSettingsDesc')}>
        <form onSubmit={onSaveSettings} className="grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('schoolUpiId')}</span>
            <input
              required
              value={schoolPaymentSettings.upiId}
              onChange={(e) => setSchoolPaymentSettings({ upiId: e.target.value })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('accountName')}</span>
            <input
              required
              value={schoolPaymentSettings.accountName}
              onChange={(e) => setSchoolPaymentSettings({ accountName: e.target.value })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('bankName')}</span>
            <input
              value={schoolPaymentSettings.bankName}
              onChange={(e) => setSchoolPaymentSettings({ bankName: e.target.value })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">{t('paymentInstructions')}</span>
            <input
              value={schoolPaymentSettings.instructions}
              onChange={(e) => setSchoolPaymentSettings({ instructions: e.target.value })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="btn-accent sm:col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            {saving ? t('saving') : t('savePaymentSettings')}
          </button>
        </form>
      </Panel>

      <Panel title={t('utrInboxTitle')} subtitle={t('utrInboxDesc')}>
        <div className="space-y-2.5">
          {pending.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noPendingUtr')}</p>
          ) : (
            pending.map((p) => (
              <Card key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{p.utr}</p>
                    <Eyebrow>
                      {p.payerName || 'Parent'}
                      {p.studentName ? ` · ${p.studentName}` : ''} · ₹{p.amount.toLocaleString()} ·{' '}
                      {p.paidOn || '—'}
                    </Eyebrow>
                    {p.note ? <p className="text-[10px] text-slate-400 mt-1">{p.note}</p> : null}
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${SUB_STATUS_CLASS[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void reviewUtrPayment(p.id, 'Verified', session?.userId)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {t('verifyPayment')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void reviewUtrPayment(p.id, 'Rejected', session?.userId)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    {t('rejectPayment')}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}
