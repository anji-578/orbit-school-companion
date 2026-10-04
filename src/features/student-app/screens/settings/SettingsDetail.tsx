import { useState } from 'react'
import { useAuthStore } from '../../../../auth/authStore'
import { useOrbitStore } from '../../../../store/orbitStore'
import { childClassLabel, childDisplayName } from '../../../../lib/linkedStudent'
import { getSupabase } from '../../../../lib/supabase'
import { AlertsPanel } from '../../../shared/AlertsPanel'
import { SaCard, SaSection } from '../../components/SaUi'
import type { SettingsSectionId } from '../../studentNav'
import { AboutSection, FeedbackSection, HelpSection } from './SettingsSupport'
import type { ThemeMode } from '../../../../types'

function Field({ label, value, managed }: { label: string; value: string; managed?: boolean }) {
  return (
    <div className="px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-o-faint">
        {label}
        {managed ? ' · Managed by school' : ' · You can edit'}
      </p>
      <p className="mt-1 text-sm text-o-text">{value || '—'}</p>
    </div>
  )
}

export function SettingsDetail({ section }: { section: SettingsSectionId }) {
  switch (section) {
    case 'personal':
      return <PersonalSection />
    case 'security':
      return <SecuritySection />
    case 'privacy':
      return <PrivacySection />
    case 'notifications':
      return (
        <div className="student-embed -mx-1">
          <AlertsPanel />
        </div>
      )
    case 'appearance':
      return <AppearanceSection />
    case 'language':
      return <LanguageSection />
    case 'accessibility':
      return <AccessibilitySection />
    case 'school':
      return <SchoolInfoSection />
    case 'academic':
      return <AcademicInfoSection />
    case 'help':
      return <HelpSection />
    case 'feedback':
      return <FeedbackSection kind="feedback" />
    case 'report':
      return <FeedbackSection kind="problem" />
    case 'about':
      return <AboutSection />
    default:
      return null
  }
}

function PersonalSection() {
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const name = childDisplayName(linkedStudent, session?.displayName || studentProfile.name)
  const grade = childClassLabel(linkedStudent) || studentProfile.grade
  const [statement, setStatement] = useState(studentProfile.statement ?? '')

  return (
    <div className="space-y-4 pb-4">
      <SaSection eyebrow="Managed by school">
        <SaCard className="divide-y divide-o-border p-0">
          <Field label="Name" value={name} managed />
          <Field label="Class" value={grade} managed />
          <Field label="Student ID" value={linkedStudent?.id ? linkedStudent.id.slice(0, 8) : ''} managed />
          <Field label="School" value={studentProfile.school} managed />
        </SaCard>
      </SaSection>
      <SaSection eyebrow="You can edit">
        <SaCard className="space-y-2 p-4">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-o-faint">Personal statement</label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value.slice(0, 180))}
            rows={3}
            className="w-full rounded-button border border-o-border bg-o-surface-2 px-3 py-2 text-sm text-o-text"
          />
          <button
            type="button"
            className="o-focus min-h-11 rounded-button bg-o-primary px-4 text-sm font-semibold text-white"
            onClick={() => {
              updateStudentProfile({ statement })
              triggerToast('Statement saved on this device')
            }}
          >
            Save statement
          </button>
        </SaCard>
      </SaSection>
    </div>
  )
}

function SecuritySection() {
  const session = useAuthStore((s) => s.session)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const canPassword = session?.provider === 'supabase'

  const changePassword = async () => {
    if (password.length < 8) {
      triggerToast('Use at least 8 characters')
      return
    }
    setBusy(true)
    const supabase = getSupabase()
    const { error } = supabase ? await supabase.auth.updateUser({ password }) : { error: { message: 'Unavailable' } }
    setBusy(false)
    if (error) {
      triggerToast(error.message)
      return
    }
    setPassword('')
    triggerToast('Password updated')
  }

  return (
    <div className="space-y-4 pb-4">
      <SaSection eyebrow="Sign-in">
        <SaCard className="divide-y divide-o-border p-0">
          <Field label="Email" value={session?.email ?? ''} managed />
          <Field label="Method" value={session?.provider === 'supabase' ? 'School account' : 'Local session'} managed />
        </SaCard>
      </SaSection>
      {canPassword ? (
        <SaSection eyebrow="Change password">
          <SaCard className="space-y-3 p-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-button border border-o-border bg-o-surface-2 px-3 py-2 text-sm text-o-text"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void changePassword()}
              className="o-focus min-h-11 rounded-button bg-o-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              Update password
            </button>
          </SaCard>
        </SaSection>
      ) : (
        <p className="px-1 text-[13px] text-o-muted">Password changes are available for school-signed-in accounts.</p>
      )}
    </div>
  )
}

function PrivacySection() {
  const privacyProfile = useOrbitStore((s) => s.privacyProfile)
  const setPrivacyProfile = useOrbitStore((s) => s.setPrivacyProfile)
  const options = [
    { id: 'school' as const, label: 'School staff only', hint: 'Safest default' },
    { id: 'teachers' as const, label: 'My teachers', hint: 'Class teachers can see growth details' },
    { id: 'private' as const, label: 'Only me', hint: 'Hide extra profile details from classmates' },
  ]
  return (
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
  )
}

function AppearanceSection() {
  const theme = useOrbitStore((s) => s.theme)
  const setTheme = useOrbitStore((s) => s.setTheme)
  const modes: { id: ThemeMode; label: string }[] = [
    { id: 'system', label: 'System' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ]
  return (
    <SaSection eyebrow="Theme">
      <div className="flex gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setTheme(m.id)}
            className={`o-focus min-h-11 flex-1 rounded-button text-sm font-semibold border ${
              theme === m.id ? 'border-o-primary bg-o-primary text-white' : 'border-o-border text-o-muted'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </SaSection>
  )
}

function LanguageSection() {
  const lang = useOrbitStore((s) => s.lang)
  const setLang = useOrbitStore((s) => s.setLang)
  return (
    <SaSection eyebrow="Language">
      <div className="flex gap-2">
        {(['en', 'te'] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className={`o-focus min-h-11 flex-1 rounded-button text-sm font-semibold border ${
              lang === code ? 'border-o-primary bg-o-primary text-white' : 'border-o-border text-o-muted'
            }`}
          >
            {code === 'en' ? 'English' : 'తెలుగు'}
          </button>
        ))}
      </div>
    </SaSection>
  )
}

function AccessibilitySection() {
  const largerText = useOrbitStore((s) => s.largerText)
  const reduceMotion = useOrbitStore((s) => s.reduceMotion)
  const setLargerText = useOrbitStore((s) => s.setLargerText)
  const setReduceMotion = useOrbitStore((s) => s.setReduceMotion)
  return (
    <SaSection eyebrow="Reading">
      <SaCard className="divide-y divide-o-border p-0">
        <label className="flex min-h-14 items-center justify-between px-3 py-3 text-sm text-o-text">
          Larger text
          <input type="checkbox" checked={largerText} onChange={(e) => setLargerText(e.target.checked)} />
        </label>
        <label className="flex min-h-14 items-center justify-between px-3 py-3 text-sm text-o-text">
          Reduce motion
          <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} />
        </label>
      </SaCard>
    </SaSection>
  )
}

function SchoolInfoSection() {
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  return (
    <SaSection eyebrow="School">
      <SaCard className="divide-y divide-o-border p-0">
        <Field label="School name" value={studentProfile.school} managed />
        <Field label="Campus" value="" managed />
        <Field label="Website" value="" managed />
      </SaCard>
    </SaSection>
  )
}

function AcademicInfoSection() {
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const grade = childClassLabel(linkedStudent) || studentProfile.grade
  return (
    <SaSection eyebrow="Enrollment">
      <SaCard className="divide-y divide-o-border p-0">
        <Field label="Grade / section" value={grade} managed />
      </SaCard>
    </SaSection>
  )
}
