import { useMemo } from 'react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childClassLabel, childDisplayName } from '../../../lib/linkedStudent'
import { chapterProgress } from '../../../store/orbitHelpers'
import { SaSection, SaViewAll } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import { presentStreak } from '@/domain/streak/present-streak'
import { AchievementBadge, ICON, IconTile, ProgressBar, TagChip } from '@/shared/ui/orbit'

const QUICK = [
  {
    title: 'Personal details',
    desc: 'Name, photo, bio',
    icon: ICON.me.personal,
    tone: 'purple' as const,
    go: 'profile' as const,
  },
  {
    title: 'School info',
    desc: 'Class, teachers',
    icon: ICON.me.school,
    tone: 'blue' as const,
    go: 'school-records' as const,
  },
  {
    title: 'Account & security',
    desc: 'Password, access',
    icon: ICON.me.security,
    tone: 'green' as const,
    go: 'settings' as const,
  },
  {
    title: 'Notifications',
    desc: 'Alerts & digests',
    icon: ICON.me.notifications,
    tone: 'orange' as const,
    go: 'alerts' as const,
  },
]

const SUPPORT = [
  { title: 'Help & support', desc: 'Guides and FAQs', icon: ICON.me.help, go: 'settings' as const },
  {
    title: 'Give feedback',
    desc: 'Tell us what to improve',
    icon: ICON.me.feedback,
    go: 'settings' as const,
  },
  { title: 'About Orbit', desc: 'Version 0.0.0', icon: ICON.me.about, go: 'settings' as const },
]

const BADGE_CATALOGUE = [
  {
    id: 'streak',
    title: '5-Day Streak',
    hint: 'Show up five days',
    icon: ICON.badge.streak,
    light: '#FFB02E',
    dark: '#E07B0B',
  },
  {
    id: 'homework',
    title: 'Homework Pro',
    hint: 'Finish 10 tasks',
    icon: ICON.badge.homework,
    light: '#8A5CFF',
    dark: '#5A2FD6',
  },
  {
    id: 'nature',
    title: 'Nature Champion',
    hint: 'Join a green club',
    icon: ICON.badge.nature,
    light: '#25D68F',
    dark: '#0E9E66',
  },
  {
    id: 'team',
    title: 'Team Player',
    hint: 'Compete with friends',
    icon: ICON.badge.team,
    light: '#4A86FF',
    dark: '#2444D6',
  },
]

function interestIcon(name: string) {
  const key = name.toLowerCase()
  if (key.includes('tech') || key.includes('coding')) return ICON.interest.technology
  if (key.includes('sport') || key.includes('cricket')) return ICON.interest.sports
  if (key.includes('art') || key.includes('draw')) return ICON.interest.arts
  if (key.includes('music')) return ICON.interest.music
  if (key.includes('space')) return ICON.interest.space
  if (key.includes('science')) return ICON.interest.science
  if (key.includes('business')) return ICON.interest.business
  return ICON.interest.default
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'OR'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function MeHub() {
  const { push } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const totalXp = useOrbitStore((s) => s.totalXp)
  const tasks = useOrbitStore((s) => s.tasks)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const Chevron = ICON.chrome.chevron
  const Edit = ICON.me.edit

  const name = childDisplayName(linkedStudent, session?.displayName || studentProfile.name)
  const grade = childClassLabel(linkedStudent) || studentProfile.grade
  const school = studentProfile.school || 'Your school'
  const streak = presentStreak(attendanceRecords)
  const completedTasks = tasks.filter((t) => t.completed).length

  const overall = useMemo(() => {
    if (curriculum.length === 0) return 0
    return Math.round(curriculum.reduce((sum, c) => sum + chapterProgress(c), 0) / curriculum.length)
  }, [curriculum])

  const improving = useMemo(
    () => curriculum.filter((c) => chapterProgress(c) >= 40 && chapterProgress(c) < 85).length,
    [curriculum],
  )

  const earned = new Set(unlockedBadges.map((b) => b.toLowerCase()))

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-[28px] font-extrabold text-o-text">Me</h1>
        <p className="mt-1 text-[14px] text-o-muted">Your journey. Your progress. Your story.</p>
      </div>

      <div className="o-card space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full font-display text-lg font-extrabold text-white"
            style={{
              background: 'linear-gradient(145deg,#4A86FF,#2444D6)',
              boxShadow:
                '0 0 0 3px var(--o-bg), 0 0 0 6px color-mix(in srgb, var(--o-primary) 55%, transparent)',
            }}
            aria-hidden
          >
            {initials(name)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-[21px] font-extrabold text-o-text">{name}</h2>
            <p className="mt-0.5 text-[13px] text-o-muted">
              {grade} · {school}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {streak > 0 ? <TagChip label={`${streak}-day streak`} tone="orange" /> : null}
              {totalXp > 0 ? <TagChip label={`${totalXp} XP`} tone="blue" /> : null}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => push('profile')}
          className="o-focus inline-flex min-h-11 items-center gap-1 rounded-button border border-o-border bg-o-surface-2 px-3 text-[12px] font-semibold text-o-primary"
        >
          <Edit className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Edit profile
        </button>
      </div>

      <div
        className="o-card relative overflow-hidden p-4"
        style={{ background: 'linear-gradient(135deg, var(--o-sci-from), var(--o-sci-to))' }}
      >
        <img
          src="/art/plant.svg"
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full w-[45%] object-contain opacity-50"
          aria-hidden
        />
        <p className="relative max-w-[72%] font-display text-[16px] font-semibold leading-snug text-o-text">
          “Curious today, capable tomorrow.”
        </p>
        <button
          type="button"
          onClick={() => push('profile')}
          className="o-focus relative mt-3 text-[12px] font-semibold text-o-primary"
        >
          Edit →
        </button>
      </div>

      <SaSection eyebrow="Quick actions">
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map(({ title, desc, icon, tone, go }) => (
            <button
              key={title}
              type="button"
              onClick={() => push(go)}
              className="o-card o-focus flex min-h-11 items-start gap-2.5 p-3 text-left active:scale-[0.98]"
            >
              <IconTile icon={icon} tone={tone} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-o-text">{title}</span>
                <span className="mt-0.5 block text-[11px] text-o-muted">{desc}</span>
              </span>
              <Chevron className="mt-1 h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </SaSection>

      <SaSection
        eyebrow="My progress"
        action={<SaViewAll label="View all" onClick={() => push('academics')} />}
      >
        <div className="o-card grid grid-cols-4 divide-x divide-o-border p-3">
          <div className="space-y-2 px-2 first:pl-0">
            <IconTile icon={ICON.me.overall} tone="blue" size="sm" />
            <p className="font-display text-lg font-extrabold tabular-nums text-o-text">{overall}%</p>
            <p className="text-[10.5px] text-o-muted">Syllabus covered</p>
            <ProgressBar value={overall} height={4} label="Syllabus covered" />
          </div>
          <div className="space-y-2 px-2">
            <IconTile icon={ICON.me.tasks} tone="green" size="sm" />
            <p className="font-display text-lg font-extrabold tabular-nums text-o-text">{completedTasks}</p>
            <p className="text-[10.5px] text-o-muted">Tasks done this month</p>
          </div>
          <div className="space-y-2 px-2">
            <IconTile icon={ICON.me.active} tone="orange" size="sm" />
            <p className="font-display text-lg font-extrabold tabular-nums text-o-text">{streak}</p>
            <p className="text-[10.5px] text-o-muted">Days active in a row</p>
          </div>
          <div className="space-y-2 px-2 last:pr-0">
            <IconTile icon={ICON.me.improving} tone="pink" size="sm" />
            <p className="font-display text-lg font-extrabold tabular-nums text-o-text">{improving}</p>
            <p className="text-[10.5px] text-o-muted">Subjects improving</p>
          </div>
        </div>
      </SaSection>

      <SaSection eyebrow="Achievements" action={<SaViewAll onClick={() => push('achievements')} />}>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {BADGE_CATALOGUE.map((b) => {
            const locked = ![...earned].some(
              (e) => e.includes(b.id) || e.includes(b.title.toLowerCase().split(' ')[0]!),
            )
            return (
              <div
                key={b.id}
                className="o-card flex w-[118px] shrink-0 flex-col items-center gap-2 p-3 text-center"
              >
                <AchievementBadge
                  icon={b.icon}
                  light={b.light}
                  dark={b.dark}
                  locked={locked}
                  label={b.title}
                />
                <p className="text-[12px] font-semibold text-o-text">{b.title}</p>
                <p className="text-[10.5px] text-o-muted">{locked ? b.hint : 'Unlocked'}</p>
              </div>
            )
          })}
        </div>
      </SaSection>

      <SaSection eyebrow="My interests" action={<SaViewAll label="Edit" onClick={() => push('interests')} />}>
        {(studentProfile.interests || []).length === 0 ? (
          <button
            type="button"
            onClick={() => push('interests')}
            className="o-focus inline-flex min-h-11 items-center rounded-full border border-dashed border-o-border-strong px-4 text-[12px] font-semibold text-o-primary"
          >
            + Add interests
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {studentProfile.interests.map((i) => {
              const Icon = interestIcon(i)
              return (
                <span
                  key={i}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-o-border bg-o-surface-2 px-3 text-[12px] font-semibold text-o-text"
                >
                  <Icon className="h-4 w-4 text-o-primary" strokeWidth={1.75} aria-hidden />
                  {i}
                </span>
              )
            })}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Support">
        <div className="o-card divide-y divide-o-border p-0">
          {SUPPORT.map(({ title, desc, icon: Icon, go }) => (
            <button
              key={title}
              type="button"
              onClick={() => push(go)}
              className="o-focus flex min-h-14 w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Icon className="h-5 w-5 shrink-0 text-o-muted" strokeWidth={1.75} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-o-text">{title}</span>
                <span className="mt-0.5 block text-[12px] text-o-muted">{desc}</span>
              </span>
              <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </SaSection>
    </div>
  )
}
