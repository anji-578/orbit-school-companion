import { SaCard, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import { ICON, IconTile } from '@/shared/ui/orbit'
import type { SettingsSectionId } from '../studentNav'
import { SETTINGS_SECTION_TITLES } from '../studentNav'
import { SettingsDetail } from './settings/SettingsDetail'
import { orbitAppVersion } from '@/shared/lib/app-version'

const ACCOUNT: { id: SettingsSectionId; icon: typeof ICON.me.personal; tone: 'purple' | 'green' | 'blue' }[] = [
  { id: 'personal', icon: ICON.me.personal, tone: 'purple' },
  { id: 'security', icon: ICON.me.security, tone: 'green' },
  { id: 'privacy', icon: ICON.me.school, tone: 'blue' },
]

const PREFS: { id: SettingsSectionId; icon: typeof ICON.me.notifications; tone: 'orange' | 'blue' | 'purple' | 'green' }[] =
  [
    { id: 'notifications', icon: ICON.me.notifications, tone: 'orange' },
    { id: 'appearance', icon: ICON.chrome.themeDark, tone: 'blue' },
    { id: 'language', icon: ICON.me.help, tone: 'purple' },
    { id: 'accessibility', icon: ICON.me.personal, tone: 'green' },
  ]

const SCHOOL: SettingsSectionId[] = ['school', 'academic']
const SUPPORT: SettingsSectionId[] = ['help', 'feedback', 'report', 'about']

export function SettingsScreen() {
  const { params, push, openLogoutConfirm } = useStudentNav()
  const SignOut = ICON.chrome.signOut
  const Chevron = ICON.chrome.chevron
  const section = params.settingsSection

  if (section) return <SettingsDetail section={section} />

  const row = (id: SettingsSectionId) => (
    <button
      key={id}
      type="button"
      onClick={() => push('settings', { settingsSection: id }, SETTINGS_SECTION_TITLES[id])}
      className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-o-text">{SETTINGS_SECTION_TITLES[id]}</span>
        {id === 'about' ? (
          <span className="text-[12px] text-o-muted">Version {orbitAppVersion()}</span>
        ) : null}
      </span>
      <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
    </button>
  )

  return (
    <div className="space-y-5 pb-4">
      <p className="px-0.5 text-[13px] text-o-muted">Preferences for your Orbit companion.</p>

      <SaSection eyebrow="Account">
        <SaCard className="divide-y divide-o-border p-0">
          {ACCOUNT.map(({ id, icon, tone }) => (
            <button
              key={id}
              type="button"
              onClick={() => push('settings', { settingsSection: id }, SETTINGS_SECTION_TITLES[id])}
              className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left"
            >
              <IconTile icon={icon} tone={tone} size="md" />
              <span className="min-w-0 flex-1 text-sm font-semibold text-o-text">{SETTINGS_SECTION_TITLES[id]}</span>
              <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Preferences">
        <SaCard className="divide-y divide-o-border p-0">
          {PREFS.map(({ id, icon, tone }) => (
            <button
              key={id}
              type="button"
              onClick={() => push('settings', { settingsSection: id }, SETTINGS_SECTION_TITLES[id])}
              className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left"
            >
              <IconTile icon={icon} tone={tone} size="md" />
              <span className="min-w-0 flex-1 text-sm font-semibold text-o-text">{SETTINGS_SECTION_TITLES[id]}</span>
              <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </SaCard>
      </SaSection>

      <SaSection eyebrow="School">
        <SaCard className="divide-y divide-o-border p-0">{SCHOOL.map(row)}</SaCard>
      </SaSection>

      <SaSection eyebrow="Support">
        <SaCard className="divide-y divide-o-border p-0">{SUPPORT.map(row)}</SaCard>
      </SaSection>

      <SaSection eyebrow="Account action">
        <SaCard className="p-2">
          <button
            type="button"
            onClick={openLogoutConfirm}
            className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left text-o-danger"
          >
            <SignOut className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            <span className="text-sm font-semibold">Log out</span>
          </button>
        </SaCard>
      </SaSection>
    </div>
  )
}
