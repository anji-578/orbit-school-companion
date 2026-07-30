import { useState } from 'react'
import type { FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import type { LeaveStatus } from '../../types'

const STATUS_CLASS: Record<LeaveStatus, string> = {
  Reviewing: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Declined: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

export function TeacherLeaves() {
  const lang = useOrbitStore((s) => s.lang)
  const leaves = useOrbitStore((s) => s.leaves)
  const submitLeave = useOrbitStore((s) => s.submitLeave)

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  const t = (key: string) => translate(lang, key)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!date.trim() || !reason.trim()) return
    submitLeave(date, reason)
    setDate('')
    setReason('')
  }

  return (
    <div className="space-y-6">
      <Panel title={t('teacherLeavesTitle')} subtitle={t('teacherLeavesDesc')}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. July 20, 2026"
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reason</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for leave"
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            className="btn-accent flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            {t('submitLeave')}
          </button>
        </form>
      </Panel>

      <Panel title="Leave Status Queue">
        <div className="space-y-2.5">
          {leaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No leave requests submitted yet.</p>
          ) : (
            leaves.map((leave) => (
              <Card key={leave.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">{leave.reason}</p>
                  <Eyebrow>{leave.date}</Eyebrow>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${STATUS_CLASS[leave.status]}`}>
                  {leave.status}
                </span>
              </Card>
            ))
          )}
        </div>
      </Panel>
    </div>
  )
}
