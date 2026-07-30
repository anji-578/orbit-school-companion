import { CheckCircle2, Download, Loader2, Receipt, Wallet } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'

const FEE_STATUS_CLASS: Record<string, string> = {
  Paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Unpaid: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Overdue: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

export function PaymentsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const fees = useOrbitStore((s) => s.fees)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const paymentProcessing = useOrbitStore((s) => s.paymentProcessing)
  const paymentReceipt = useOrbitStore((s) => s.paymentReceipt)
  const paymentHistory = useOrbitStore((s) => s.paymentHistory)
  const upiId = useOrbitStore((s) => s.upiId)
  const setUpiId = useOrbitStore((s) => s.setUpiId)
  const executePayment = useOrbitStore((s) => s.executePayment)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const t = (key: string) => translate(lang, key)

  const handleDownload = (receiptId: string) => {
    triggerToast(`${t('downloadReceipt')}: ${receiptId} (demo file)`)
    try {
      const blob = new Blob([`Orbit School — Payment Receipt\nReceipt ID: ${receiptId}\nThis is a simulated demo receipt.`], {
        type: 'text/plain',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${receiptId}.txt`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      // no-op: download is a demo convenience only
    }
  }

  return (
    <div className="space-y-6">
      <Panel title={t('billingTitle')}>
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
            <Eyebrow>{t('billingUPI')}</Eyebrow>
            <div className="flex items-center gap-2 field rounded-xl px-3.5 py-3">
              <Wallet className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
              <label htmlFor="upi-id" className="sr-only">
                UPI ID
              </label>
              <input
                id="upi-id"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="bg-transparent flex-1 text-sm text-white placeholder:text-slate-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">{t('billingSimulateUPI')}</p>
            <button
              type="button"
              onClick={executePayment}
              disabled={paymentProcessing || upiId.trim().length < 3}
              className="btn-accent w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {t('processingPayment')}
                </>
              ) : (
                <>{t('payNow')} · ₹{outstandingFees.toLocaleString()}</>
              )}
            </button>
            <p className="text-[9px] text-slate-500 text-center">{t('billingDemoNote')}</p>
          </Card>
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
              onClick={() => handleDownload(paymentReceipt.id)}
              className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              {t('downloadReceipt')}
            </button>
          </Card>
        ) : null}
      </Panel>

      <Panel title={t('billingHistory')}>
        <div className="space-y-2.5">
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <Receipt className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{payment.name}</p>
                  <p className="text-[10px] text-slate-400">{payment.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black text-white">₹{payment.amount.toLocaleString()}</span>
                <button
                  type="button"
                  onClick={() => handleDownload(payment.receiptId)}
                  aria-label={`Download receipt ${payment.receiptId}`}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
