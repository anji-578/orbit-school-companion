import { useMemo } from 'react'
import {
  Award,
  Bell,
  Briefcase,
  ChartColumnIncreasing,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  HelpCircle,
  Info,
  Lock,
  MessageSquare,
  School,
  UserRound,
} from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childClassLabel, childDisplayName } from '../../../lib/linkedStudent'
import { chapterProgress } from '../../../store/orbitHelpers'
import { SaSection, SaViewAll } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import { presentStreak } from '@/domain/streak/present-streak'

const QUICK = [
  { title: 'Personal details', desc: 'Name, photo, bio', icon: UserRound, tone: 'text-violet-300 bg-violet-500/15', go: 'profile' as const },
  { title: 'School info', desc: 'Class, teachers', icon: School, tone: 'text-sky-300 bg-sky-500/15', go: 'school-records' as const },
  { title: 'Account & security', desc: 'Password, access', icon: Lock, tone: 'text-emerald-300 bg-emerald-500/15', go: 'settings' as const },
  { title: 'Notifications', desc: 'Alerts & digests', icon: Bell, tone: 'text-amber-300 bg-amber-500/15', go: 'alerts' as const },
]

const SUPPORT = [
  { title: 'Help & support', desc: 'Guides and FAQs', icon: HelpCircle, go: 'settings' as const },
  { title: 'Give feedback', desc: 'Tell us what to improve', icon: MessageSquare, go: 'settings' as const },
  { title: 'About Orbit', desc: 'Version and credits', icon: Info, go: 'settings' as const },
]

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

  const name = childDisplayName(linkedStudent, session?.displayName || studentProfile.name)
  const grade = childClassLabel(linkedStudent) || studentProfile.grade
  const school = studentProfile.school
  const streak = presentStreak(attendanceRecords)
  const completedTasks = tasks.filter((t) => t.completed).length

  const overall = useMemo(() => {
    if (curriculum.length === 0) return 0
    return Math.round(curriculum.reduce((sum, c) => sum + chapterProgress(c), 0) / curriculum.length)
  }, [curriculum])

  const improving = useMemo(() => {
    return curriculum.filter((c) => chapterProgress(c) >= 40 && chapterProgress(c) < 85).length
  }, [curriculum])

  const achievements = [
    ...(unlockedBadges.slice(0, 4).map((b) => ({ id: b, title: b }))),
    ...(studentProfile.achievements || []).slice(0, 4),
  ].slice(0, 4)

  return (
    <div className="space-y-6 pb-8">
      <section className="grid grid-cols-[1.1fr_0.9fr] gap-3">
        <div className="orbit-card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orbit-primary/15">
              {studentProfile.photoUrl ? (
                <img src={studentProfile.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-7 w-7 text-orbit-primary" strokeWidth={1.75} aria-hidden />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-lg font-bold text-white">{name}</h1>
              <p className="mt-0.5 text-[12px] text-orbit-text-secondary">
                {grade}
                {school ? ` · ${school}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => push('profile')}
            className="inline-flex w-fit items-center gap-1 rounded-btn border border-white/[0.08] bg-orbit-surface-raised px-3 py-2 text-[12px] font-semibold text-orbit-primary"
          >
            Edit profile <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="orbit-card relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-[#0B2A22] to-[#091715]">
          <img
            src="/brand/student-motivation-banner.png"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091715] via-[#091715]/80 to-transparent" />
          <p className="relative font-heading text-sm font-semibold leading-snug text-white">
            Curious today, capable tomorrow.
          </p>
        </div>
      </section>

      <SaSection eyebrow="Quick actions">
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map(({ title, desc, icon: Icon, tone, go }) => (
            <button key={title} type="button" onClick={() => push(go)} className="orbit-card-interactive flex items-start gap-2.5 text-left">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-icon ${tone}`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{title}</span>
                <span className="mt-0.5 block text-[11px] text-orbit-text-secondary">{desc}</span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </SaSection>

      <SaSection eyebrow="My progress" action={<SaViewAll label="Edit →" onClick={() => push('academics')} />}>
        <div className="grid grid-cols-2 gap-3">
          <div className="orbit-card space-y-2">
            <p className="font-heading text-xl font-bold text-white">{overall}%</p>
            <p className="text-[11px] text-orbit-text-secondary">Overall progress</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-orbit-primary" style={{ width: `${overall}%` }} />
            </div>
          </div>
          <button type="button" onClick={() => push('upcoming')} className="orbit-card-interactive flex items-start gap-2 text-left">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" strokeWidth={1.75} aria-hidden />
            <span>
              <span className="block font-heading text-xl font-bold text-white">{completedTasks}</span>
              <span className="mt-1 block text-[11px] text-orbit-text-secondary">Tasks completed</span>
            </span>
          </button>
          <button type="button" onClick={() => push('school-records')} className="orbit-card-interactive flex items-start gap-2 text-left">
            <Flame className="mt-0.5 h-5 w-5 text-orange-400" strokeWidth={1.75} aria-hidden />
            <span>
              <span className="block font-heading text-xl font-bold text-white">{streak}</span>
              <span className="mt-1 block text-[11px] text-orbit-text-secondary">Day streak</span>
            </span>
          </button>
          <button type="button" onClick={() => push('academics')} className="orbit-card-interactive flex items-start gap-2 text-left">
            <ChartColumnIncreasing className="mt-0.5 h-5 w-5 text-pink-400" strokeWidth={1.75} aria-hidden />
            <span>
              <span className="block font-heading text-xl font-bold text-white">{improving}</span>
              <span className="mt-1 block text-[11px] text-orbit-text-secondary">Subjects improving</span>
            </span>
          </button>
        </div>
        {totalXp > 0 ? (
          <p className="px-0.5 text-[11px] text-orbit-text-muted">{totalXp} XP earned</p>
        ) : null}
      </SaSection>

      <SaSection eyebrow="Achievements" action={<SaViewAll onClick={() => push('achievements')} />}>
        {achievements.length === 0 ? (
          <p className="text-xs text-orbit-text-secondary">Wins from competitions and study will land here.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="orbit-card flex items-start gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-icon bg-amber-500/15">
                  <Award className="h-5 w-5 text-amber-400" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{a.title}</span>
                  <span className="mt-0.5 block text-[11px] text-orbit-text-secondary">Unlocked</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="My interests" action={<SaViewAll label="Edit →" onClick={() => push('interests')} />}>
        {(studentProfile.interests || []).length === 0 ? (
          <p className="text-xs text-orbit-text-secondary">Add interests in Grow — they show up here.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {studentProfile.interests.map((i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-orbit-surface-raised px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                <Briefcase className="h-3.5 w-3.5 text-orbit-accent" strokeWidth={1.75} aria-hidden />
                {i}
              </span>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Support">
        <div className="orbit-card divide-y divide-white/[0.06] p-0">
          {SUPPORT.map(({ title, desc, icon: Icon, go }) => (
            <button
              key={title}
              type="button"
              onClick={() => push(go)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <Icon className="h-5 w-5 shrink-0 text-orbit-text-secondary" strokeWidth={1.75} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">{title}</span>
                <span className="mt-0.5 block text-[11px] text-orbit-text-secondary">{desc}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </SaSection>
    </div>
  )
}
