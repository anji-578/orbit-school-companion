import { Check, X } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import type { LeaveStatus } from '../../types'

const STATUS_CLASS: Record<LeaveStatus, string> = {
  Reviewing: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Declined: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

export function SchoolLeaves() {
  const lang = useOrbitStore((s) => s.lang)
  const leaves = useOrbitStore((s) => s.leaves)
  const setLeaveStatus = useOrbitStore((s) => s.setLeaveStatus)

  const t = (key: string) => translate(lang, key)
  const pending = leaves.filter((l) => l.status === 'Reviewing')
  const decided = leaves.filter((l) => l.status !== 'Reviewing')

  return (
    <div className="space-y-6">
      <Panel title={t('schoolLeavesTitle')} subtitle={t('schoolLeavesDesc')}>
        <div className="space-y-2.5">
          {pending.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noPendingLeaves')}</p>
          ) : (
            pending.map((leave) => (
              <Card key={leave.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{leave.reason}</p>
                    <Eyebrow>
                      {leave.teacherName ?? 'Teacher'} · {leave.date}
                    </Eyebrow>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${STATUS_CLASS[leave.status]}`}
                  >
                    {leave.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveStatus(leave.id, 'Approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25 transition"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    {t('approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveStatus(leave.id, 'Declined')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/25 transition"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    {t('decline')}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Panel>

      {decided.length > 0 ? (
        <Panel title={t('leaveHistory')}>
          <div className="space-y-2.5">
            {decided.map((leave) => (
              <Card key={leave.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">{leave.reason}</p>
                  <Eyebrow>{leave.date}</Eyebrow>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${STATUS_CLASS[leave.status]}`}
                >
                  {leave.status}
                </span>
              </Card>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  )
}
