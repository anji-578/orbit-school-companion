import { useState } from 'react'
import { useAuthStore } from '../../../../auth/authStore'
import { useOrbitStore } from '../../../../store/orbitStore'
import {
  downloadJsonFile,
  exportMyStudentData,
  requestMyAccountDeletion,
} from '../../../../lib/studentDsar'
import { SaCard, SaSection } from '../../components/SaUi'

export function PrivacySettings() {
  const privacyProfile = useOrbitStore((s) => s.privacyProfile)
  const setPrivacyProfile = useOrbitStore((s) => s.setPrivacyProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const logout = useAuthStore((s) => s.logout)
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null)
  const options = [
    { id: 'school' as const, label: 'School staff only', hint: 'Safest default' },
    { id: 'teachers' as const, label: 'My teachers', hint: 'Class teachers can see growth details' },
    { id: 'private' as const, label: 'Only me', hint: 'Hide extra profile details from classmates' },
  ]

  const onExport = async () => {
    setBusy('export')
    const result = await exportMyStudentData()
    setBusy(null)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    downloadJsonFile(`orbit-student-export-${Date.now()}.json`, result.payload)
    triggerToast('Download started')
  }

  const onDeleteRequest = async () => {
    const confirmed = window.confirm(
      'Request deletion of your Orbit account? Your school completes official record erasure. You will be signed out.',
    )
    if (!confirmed) return
    setBusy('delete')
    const result = await requestMyAccountDeletion()
    setBusy(null)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(`Deletion requested · ${result.requestId.slice(0, 8)}`)
    await logout()
  }

  return (
    <div className="space-y-4 pb-4">
      <SaSection eyebrow="Who can see my profile">
        <SaCard className="divide-y divide-o-border p-0">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPrivacyProfile(opt.id)}
              className="o-focus flex min-h-14 w-full items-center justify-between gap-3 px-3 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold text-o-text">{opt.label}</span>
                <span className="text-[12px] text-o-muted">{opt.hint}</span>
              </span>
              <span className="text-[12px] font-semibold text-o-primary">
                {privacyProfile === opt.id ? 'Selected' : ''}
              </span>
            </button>
          ))}
        </SaCard>
        <p className="px-1 pt-2 text-[12px] text-o-muted">
          School records still follow school permissions. This never bypasses them.
        </p>
      </SaSection>

      <SaSection eyebrow="Your data">
        <SaCard className="space-y-3 p-4">
          <p className="text-[13px] text-o-muted">
            Export Orbit-held data, or request account deletion (required for Play Store). Details:{' '}
            <a className="text-o-primary underline" href="/legal/privacy.html" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            {' · '}
            <a
              className="text-o-primary underline"
              href="/legal/delete-account.html"
              target="_blank"
              rel="noreferrer"
            >
              Delete account
            </a>
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onExport()}
            className="o-focus min-h-11 w-full rounded-button border border-o-border text-sm font-semibold text-o-text disabled:opacity-50"
          >
            {busy === 'export' ? 'Exporting…' : 'Export my data'}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void onDeleteRequest()}
            className="o-focus min-h-11 w-full rounded-button bg-o-danger text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === 'delete' ? 'Requesting…' : 'Request account deletion'}
          </button>
        </SaCard>
      </SaSection>
    </div>
  )
}
