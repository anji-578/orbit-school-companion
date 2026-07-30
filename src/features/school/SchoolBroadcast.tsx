import { useState } from 'react'
import type { FormEvent } from 'react'
import { Megaphone, Send } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'

const TARGETS = ['All', 'Parents', 'Teachers', 'Students'] as const

export function SchoolBroadcast() {
  const lang = useOrbitStore((s) => s.lang)
  const broadcasts = useOrbitStore((s) => s.broadcasts)
  const submitBroadcast = useOrbitStore((s) => s.submitBroadcast)

  const [title, setTitle] = useState('')
  const [target, setTarget] = useState<(typeof TARGETS)[number]>('All')
  const [content, setContent] = useState('')

  const t = (key: string) => translate(lang, key)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    submitBroadcast(title, target, content)
    setTitle('')
    setContent('')
  }

  return (
    <div className="space-y-6">
      <Panel title={t('schoolBroadcastingTitle')} subtitle={t('schoolBroadcastingDesc')}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid sm:grid-cols-[2fr_1fr] gap-3">
            <label className="space-y-1 block">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Circular title"
                className="field w-full rounded-lg px-3 py-2.5 text-sm"
                required
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Audience</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as (typeof TARGETS)[number])}
                className="field w-full rounded-lg px-3 py-2.5 text-sm"
              >
                {TARGETS.map((tgt) => (
                  <option key={tgt} value={tgt} className="bg-[#0D1120]">
                    {tgt}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Message</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Write your circular content..."
              className="field w-full rounded-lg px-3 py-2.5 text-sm resize-none"
              required
            />
          </label>
          <button
            type="submit"
            className="btn-accent flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold w-full sm:w-auto"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            {t('publishCircular')}
          </button>
        </form>
      </Panel>

      <Panel title="Sent Circulars">
        <div className="space-y-2.5">
          {broadcasts.map((msg) => (
            <Card key={msg.id} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Megaphone className="h-3.5 w-3.5 text-[var(--accent2)]" aria-hidden /> {msg.title}
                </h3>
                <span className="text-[9px] text-slate-500 shrink-0">{msg.date}</span>
              </div>
              <p className="text-[11px] text-slate-400">{msg.content}</p>
              <Eyebrow>To: {msg.target}</Eyebrow>
            </Card>
          ))}
        </div>
      </Panel>
    </div>
  )
}
