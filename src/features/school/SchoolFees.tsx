import { BellRing } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, StatTile } from '../../components/ui/primitives'

const FEE_STATUS_CLASS: Record<string, string> = {
  Paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Unpaid: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Overdue: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

export function SchoolFees() {
  const lang = useOrbitStore((s) => s.lang)
  const fees = useOrbitStore((s) => s.fees)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const paymentHistory = useOrbitStore((s) => s.paymentHistory)
  const nudgeFeeParents = useOrbitStore((s) => s.nudgeFeeParents)

  const t = (key: string) => translate(lang, key)
  const collected = paymentHistory.reduce((sum, p) => sum + p.amount, 0)

  return (
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
        <StatTile label="Collected (Ananya Rao)" value={`₹${collected.toLocaleString()}`} accent="#22C55E" />
        <StatTile label={t('billingInvoices')} value={String(fees.length)} />
      </div>

      <div className="space-y-2.5">
        {fees.map((fee) => (
          <div key={fee.id} className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{fee.name}</p>
              <p className="text-[10px] text-slate-400">{fee.category} · Ananya Rao</p>
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
    </Panel>
  )
}
