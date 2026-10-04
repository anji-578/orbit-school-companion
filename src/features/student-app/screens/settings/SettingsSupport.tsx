import { useState } from 'react'
import { useOrbitStore } from '../../../../store/orbitStore'
import { submitStudentFeedback } from '../../../../lib/studentFeedback'
import { orbitAppVersion } from '@/shared/lib/app-version'
import { SaCard, SaSection } from '../../components/SaUi'
import { ICON, IconTile } from '@/shared/ui/orbit'

export function HelpSection() {
  return (
    <SaSection eyebrow="Guides">
      <SaCard className="space-y-3 p-4 text-sm text-o-muted">
        <p>Home shows today&apos;s classes and homework.</p>
        <p>Learn is for subjects, assignments, and study tools.</p>
        <p>Grow is for clubs, competitions, and interests.</p>
        <p>Me is your profile, attendance, and settings.</p>
        <p>Ask your class teacher if school records look wrong — students cannot edit them.</p>
      </SaCard>
    </SaSection>
  )
}

export function FeedbackSection({ kind }: { kind: 'feedback' | 'problem' }) {
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [category, setCategory] = useState(kind === 'problem' ? 'Home' : 'General')
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(5)
  const [severity, setSeverity] = useState('medium')
  const [busy, setBusy] = useState(false)

  const send = async () => {
    if (message.trim().length < 8) {
      triggerToast('Please describe a bit more')
      return
    }
    setBusy(true)
    const result = await submitStudentFeedback({
      kind,
      category,
      message,
      rating: kind === 'feedback' ? rating : undefined,
      severity: kind === 'problem' ? severity : undefined,
    })
    setBusy(false)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    setMessage('')
    triggerToast(`Sent · request ${result.requestId.slice(0, 8)}`)
  }

  return (
    <SaSection eyebrow={kind === 'problem' ? 'Problem' : 'Feedback'}>
      <SaCard className="space-y-3 p-4">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-button border border-o-border bg-o-surface-2 px-3 py-2 text-sm text-o-text"
          placeholder="Feature"
        />
        {kind === 'feedback' ? (
          <label className="block text-[13px] text-o-muted">
            Rating {rating}
            <input
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-1 w-full"
            />
          </label>
        ) : (
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded-button border border-o-border bg-o-surface-2 px-3 py-2 text-sm text-o-text"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">Blocks me</option>
          </select>
        )}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full rounded-button border border-o-border bg-o-surface-2 px-3 py-2 text-sm text-o-text"
          placeholder={kind === 'problem' ? 'What went wrong?' : 'What should we improve?'}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void send()}
          className="o-focus min-h-11 rounded-button bg-o-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </SaCard>
    </SaSection>
  )
}

export function AboutSection() {
  const version = orbitAppVersion()
  return (
    <SaSection eyebrow="Orbit">
      <SaCard className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <IconTile icon={ICON.me.about} tone="blue" size="lg" />
          <div>
            <p className="font-display text-base font-bold text-o-text">Orbit</p>
            <p className="text-[13px] text-o-muted">Version {version}</p>
          </div>
        </div>
        <p className="text-[13px] text-o-muted">School companion for students.</p>
      </SaCard>
    </SaSection>
  )
}
