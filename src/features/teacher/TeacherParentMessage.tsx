import { useMemo, useState } from 'react'
import { MessageSquare, Search, Send } from 'lucide-react'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { classLabelsMatch } from '../../lib/schoolPolicy'
import type { RosterStudent } from '../../types'

export function TeacherParentMessage() {
  const lang = useOrbitStore((s) => s.lang)
  const t = (key: string) => translate(lang, key)
  const roster = useOrbitStore((s) => s.roster)
  const teacherActiveClass = useOrbitStore((s) => s.teacherActiveClass)
  const teacherAcademicProfile = useOrbitStore((s) => s.teacherAcademicProfile)
  const pushNotification = useOrbitStore((s) => s.pushNotification)

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<RosterStudent | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const classRoster = useMemo(() => {
    const active = roster.filter((r) => r.active !== false)
    if (!teacherActiveClass) return active
    const focused = active.filter((r) => classLabelsMatch(r.classLabel, teacherActiveClass))
    return focused.length ? focused : active
  }, [roster, teacherActiveClass])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return classRoster.slice(0, 12)
    return classRoster
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.rollNo ?? '').toLowerCase().includes(q) ||
          (s.classLabel ?? '').toLowerCase().includes(q),
      )
      .slice(0, 20)
  }, [classRoster, query])

  const send = () => {
    if (!selected || !message.trim()) {
      useOrbitStore.getState().triggerToast(t('teacherMessageNeedBoth'))
      return
    }
    setSending(true)
    const teacherName = teacherAcademicProfile.name || 'Teacher'
    const body = `${message.trim()} — ${teacherName} (${teacherActiveClass || selected.classLabel || 'class'})`
    pushNotification({
      role: 'parent',
      title: t('teacherMessageTitle').replace('{name}', selected.name.split(' ')[0]),
      body,
      studentId: selected.id,
    })
    pushNotification({
      role: 'student',
      title: t('teacherMessageStudentTitle'),
      body: message.trim(),
      studentId: selected.id,
    })
    useOrbitStore.getState().triggerToast(t('teacherMessageSent').replace('{name}', selected.name))
    setMessage('')
    setSending(false)
  }

  return (
    <Panel
      title={t('teacherMessagePanelTitle')}
      subtitle={t('teacherMessagePanelSub').replace('{class}', teacherActiveClass || '—')}
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <Eyebrow>{t('teacherSearchStudent')}</Eyebrow>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('teacherSearchPlaceholder')}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[var(--accent)]/40"
            />
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto orbit-scroll">
            {results.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3">{t('teacherNoStudents')}</p>
            ) : (
              results.map((student) => {
                const active = selected?.id === student.id
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setSelected(student)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition ${
                      active
                        ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{student.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {student.classLabel || teacherActiveClass || '—'}
                      {student.rollNo ? ` · Roll ${student.rollNo}` : ''}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <Eyebrow>{t('teacherComposeMessage')}</Eyebrow>
          {selected ? (
            <p className="text-xs text-slate-300">
              {t('teacherMessageTo')}{' '}
              <span className="font-bold text-white">{selected.name}</span>
              <span className="text-slate-500"> · {t('teacherMessageParentHint')}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic">{t('teacherPickStudent')}</p>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder={t('teacherMessagePlaceholder')}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[var(--accent)]/40 resize-y min-h-[120px]"
          />
          <button
            type="button"
            disabled={!selected || !message.trim() || sending}
            onClick={send}
            className="btn-accent px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            {t('teacherSendToParent')}
          </button>
          <p className="text-[10px] text-slate-500 flex items-start gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
            {t('teacherMessageFootnote')}
          </p>
        </Card>
      </div>
    </Panel>
  )
}
