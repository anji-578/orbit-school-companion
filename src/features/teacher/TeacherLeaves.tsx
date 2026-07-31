import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Send } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
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
  const displayName = useAuthStore((s) => s.session?.displayName)

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')

  const t = (key: string) => translate(lang, key)
  const today = new Date().toISOString().slice(0, 10)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!date.trim() || !reason.trim()) return
    submitLeave(date, reason, displayName)
    setDate('')
    setReason('')
  }

  return (
    <div className="space-y-6">
      <Panel title={t('teacherLeavesTitle')} subtitle={t('teacherLeavesDesc')}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {t('leaveDate')}
            </span>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('leaveReason')}</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('leaveReasonPlaceholder')}
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

      <Panel title={t('leaveStatusQueue')}>
        <div className="space-y-2.5">
          {leaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noLeavesYet')}</p>
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
