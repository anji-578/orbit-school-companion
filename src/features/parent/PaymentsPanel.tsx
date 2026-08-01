import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Copy, Download, Receipt } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { ChildSwitcher } from '../../components/ui/ChildSwitcher'
import { buildReceiptPdfBlob, downloadBlob } from '../../lib/receiptPdf'
import { isRazorpayConfigured, startRazorpayCheckout } from '../../lib/razorpay'

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

export function PaymentsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const fees = useOrbitStore((s) => s.fees)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const paymentReceipt = useOrbitStore((s) => s.paymentReceipt)
  const paymentHistory = useOrbitStore((s) => s.paymentHistory)
  const schoolPaymentSettings = useOrbitStore((s) => s.schoolPaymentSettings)
  const paymentSubmissions = useOrbitStore((s) => s.paymentSubmissions)
  const loadPaymentWorkspace = useOrbitStore((s) => s.loadPaymentWorkspace)
  const submitUtrPayment = useOrbitStore((s) => s.submitUtrPayment)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const session = useAuthStore((s) => s.session)

  const [utr, setUtr] = useState('')
  const [amount, setAmount] = useState(String(outstandingFees || ''))
  const [paidOn, setPaidOn] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [payingOnline, setPayingOnline] = useState(false)
  const razorpayReady = isRazorpayConfigured()

  const t = (key: string) => translate(lang, key)

  useEffect(() => {
    void loadPaymentWorkspace()
  }, [loadPaymentWorkspace])

  useEffect(() => {
    if (outstandingFees > 0) setAmount(String(outstandingFees))
  }, [outstandingFees])

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(schoolPaymentSettings.upiId)
      triggerToast(t('upiCopied'))
    } catch {
      triggerToast(schoolPaymentSettings.upiId)
    }
  }

  const handleDownload = (receipt: {
    id?: string
    receiptId?: string
    amount: number
    date: string
    name?: string
    ref?: string
  }) => {
    const receiptId = receipt.receiptId || receipt.id || 'ORBIT-RECEIPT'
    try {
      const blob = buildReceiptPdfBlob({
        schoolName: schoolPaymentSettings.accountName || 'Sunrise Public School',
        receiptId,
        amount: receipt.amount,
        date: receipt.date,
        payerName: session?.displayName,
        utr: paymentSubmissions.find((p) => p.status === 'Verified')?.utr,
        ref: receipt.ref,
      })
      downloadBlob(blob, `${receiptId}.pdf`)
      triggerToast(`${t('downloadReceipt')}: ${receiptId}.pdf`)
    } catch {
      triggerToast(t('receiptPdfFailed'))
    }
  }

  const onSubmitUtr = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const ok = await submitUtrPayment({
      amount: Number(amount) || 0,
      utr,
      paidOn,
      note,
      payerName: session?.displayName ?? 'Parent',
      userId: session?.userId,
    })
    setSubmitting(false)
    if (ok) {
      setUtr('')
      setNote('')
    }
  }

  const onPayOnline = async () => {
    setPayingOnline(true)
    const result = await startRazorpayCheckout({
      amountRupees: Number(amount) || outstandingFees,
      studentId: linkedStudent?.id,
      payerName: session?.displayName ?? 'Parent',
      description: `Fees for ${linkedStudent?.displayName || 'student'}`,
    })
    setPayingOnline(false)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(t('razorpayPaidToast'))
    void loadPaymentWorkspace()
  }

  const pendingMine = paymentSubmissions.filter((p) => p.status === 'Pending')

  if (!classLinked) {
    return (
      <Panel title={t('billingTitle')} subtitle={t('billingUtrSubtitle')}>
        <InviteRedeemCard />
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
      <ChildSwitcher compact />
      <Panel title={t('billingTitle')} subtitle={t('billingUtrSubtitle')}>
        <div className="grid sm:grid-cols-2 gap-4">
          <StatTile
            label={t('billingOutstanding')}
            value={outstandingFees > 0 ? `₹${outstandingFees.toLocaleString()}` : 'Cleared'}
            accent={outstandingFees > 0 ? '#FF6B8B' : '#22C55E'}
          />
          <StatTile label={t('billingInvoices')} value={String(fees.length)} />
        </div>

        <div className="space-y-2.5">
          {fees.map((fee) => (
            <div key={fee.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{fee.name}</p>
                <p className="text-[10px] text-slate-400">{fee.category}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black text-white">₹{fee.amount.toLocaleString()}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${FEE_STATUS_CLASS[fee.status]}`}>
                  {fee.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {outstandingFees > 0 && !paymentReceipt ? (
          <Card className="p-5 space-y-4">
            <Eyebrow>{t('payViaUpiZeroFee')}</Eyebrow>
            <div className="rounded-xl border border-white/10 bg-[#0D1120] p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">{t('schoolUpiId')}</p>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-mono font-bold text-white break-all">{schoolPaymentSettings.upiId}</p>
                <button
                  type="button"
                  onClick={() => void copyUpi()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  {t('copy')}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {schoolPaymentSettings.accountName}
                {schoolPaymentSettings.bankName ? ` · ${schoolPaymentSettings.bankName}` : ''}
              </p>
              <p className="text-[10px] text-slate-500">{schoolPaymentSettings.instructions}</p>
            </div>

            <form onSubmit={onSubmitUtr} className="space-y-3">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">{t('utrNumber')}</span>
                <input
                  required
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  placeholder="e.g. 123456789012"
                />
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t('amountPaid')}</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{t('paidOn')}</span>
                  <input
                    type="date"
                    value={paidOn}
                    onChange={(e) => setPaidOn(e.target.value)}
                    className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  />
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">{t('noteOptional')}</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="field w-full rounded-xl px-3 py-2.5 text-sm"
                  placeholder={t('notePlaceholder')}
                />
              </label>
              <button type="submit" disabled={submitting} className="btn-accent w-full rounded-xl py-3 text-sm font-bold">
                {submitting ? t('submittingUtr') : t('submitUtr')}
              </button>
              <button
                type="button"
                disabled={payingOnline || !razorpayReady}
                onClick={() => void onPayOnline()}
                className="btn-ghost w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {payingOnline ? t('razorpayOpening') : t('payOnlineRazorpay')}
              </button>
              <p className="text-[9px] text-slate-500 text-center">
                {razorpayReady ? t('razorpayReadyHint') : t('razorpayMissingHint')}
              </p>
              <p className="text-[9px] text-slate-500 text-center">{t('utrZeroFeeNote')}</p>
            </form>
          </Card>
        ) : null}

        {pendingMine.length > 0 ? (
          <Panel title={t('pendingUtrTitle')}>
            <div className="space-y-2.5">
              {pendingMine.map((p) => (
                <Card key={p.id} className="p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{p.utr}</p>
                    <p className="text-[10px] text-slate-400">
                      ₹{p.amount.toLocaleString()} · {p.paidOn || '—'}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${SUB_STATUS_CLASS[p.status]}`}>
                    {p.status}
                  </span>
                </Card>
              ))}
            </div>
          </Panel>
        ) : null}

        {paymentReceipt ? (
          <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{t('paymentSuccess')}</h3>
                <p className="text-[11px] text-slate-400">
                  {paymentReceipt.id} · ₹{paymentReceipt.amount.toLocaleString()} · {paymentReceipt.date}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownload(paymentReceipt)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {t('downloadReceipt')}
            </button>
          </Card>
        ) : null}

        {paymentHistory.length > 0 ? (
          <div className="space-y-2.5">
            <Eyebrow>{t('paymentHistory')}</Eyebrow>
            {paymentHistory.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <Receipt className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {p.receiptId} · {p.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-emerald-300">₹{p.amount.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => handleDownload({ receiptId: p.receiptId, amount: p.amount, date: p.date, name: p.name })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                    aria-label={t('downloadReceipt')}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>
    </div>
  )
}
