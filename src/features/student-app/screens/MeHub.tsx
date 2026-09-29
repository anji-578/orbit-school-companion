import { useMemo } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childClassLabel, childDisplayName } from '../../../lib/linkedStudent'
import { SaCard, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

function presentStreak(records: { status: string }[]): number {
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]?.status === 'Present') streak += 1
    else break
  }
  return streak
}

function parseScorePercent(raw: string): number {
  const [obtainedRaw, totalRaw] = raw.split('/')
  const obtained = Number(obtainedRaw) || 0
  const total = Number(totalRaw) || 50
  return Math.round((obtained / total) * 100)
}

function trendLabel(pct: number): { label: string; tone: string } {
  if (pct >= 85) return { label: 'Strong', tone: 'text-emerald-600 dark:text-emerald-400' }
  if (pct >= 70) return { label: 'Improving ↑', tone: 'text-sky-600 dark:text-sky-400' }
  return { label: 'Needs focus', tone: 'text-amber-600 dark:text-amber-400' }
}

/** Me = identity + progress + portfolio — not a contact form. */
export function MeHub() {
  const { push } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const totalXp = useOrbitStore((s) => s.totalXp)
  const teachers = useOrbitStore((s) => s.teachers)

  const name = childDisplayName(linkedStudent, session?.displayName || studentProfile.name)
  const grade = childClassLabel(linkedStudent) || studentProfile.grade
  const school =
    session?.email?.toLowerCase().includes('@demo50.orbit.app')
      ? 'Sunrise Demo Academy'
      : studentProfile.school
  const streak = presentStreak(attendanceRecords)
  const attendancePct = getAttendancePercent()

  const learning = useMemo(() => {
    const g = studentGrades[0]
    if (!g) {
      return [
        { subject: 'Mathematics', pct: 0 },
        { subject: 'Science', pct: 0 },
        { subject: 'English', pct: 0 },
      ]
    }
    return [
      { subject: 'Mathematics', pct: parseScorePercent(g.math) },
      { subject: 'Science', pct: parseScorePercent(g.science) },
      { subject: 'Chemistry', pct: parseScorePercent(g.chem) },
    ]
  }, [studentGrades])

  const achievements = [
    ...(studentProfile.achievements || []).slice(0, 3),
    ...(studentProfile.competitions || []).slice(0, 2),
  ].slice(0, 4)

  const projects = (studentProfile.projects || []).slice(0, 3)

  return (
    <div className="space-y-5 pb-4">
      {/* Identity header */}
      <SaCard className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-[var(--accent)]/15 flex items-center justify-center overflow-hidden shrink-0">
            {studentProfile.photoUrl ? (
              <img src={studentProfile.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <GraduationCap className="h-7 w-7 text-[var(--accent)]" aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-extrabold text-[var(--fg)] truncate">{name}</h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {grade} · {school || 'Orbit Student'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {streak > 0 ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-300">
              🔥 {streak}-day streak
            </span>
          ) : null}
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
            {attendancePct}% attendance
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
            {totalXp} XP
          </span>
        </div>
        <button
          type="button"
          onClick={() => push('profile')}
          className="text-[11px] font-bold text-[var(--accent)] inline-flex items-center gap-1"
        >
          Edit full profile <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </SaCard>

      <SaSection eyebrow="Learning">
        <SaCard className="p-2">
          <ul className="divide-y divide-[var(--border)]">
            {learning.map((row) => {
              const trend = trendLabel(row.pct || 70)
              return (
                <li key={row.subject}>
                  <button
                    type="button"
                    onClick={() => push('academics')}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 text-left"
                  >
                    <span className="text-sm font-bold text-[var(--fg)]">{row.subject}</span>
                    <span className={`text-xs font-bold ${trend.tone}`}>
                      {row.pct > 0 ? `${row.pct}% · ` : ''}
                      {trend.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Interests">
        <SaCard className="p-4" onClick={() => push('interests')}>
          {(studentProfile.interests || []).length === 0 ? (
            <p className="text-xs text-[var(--muted)]">Add interests in Grow — they show up here.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studentProfile.interests.map((i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)]"
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Achievements">
        <SaCard className="p-2">
          {achievements.length === 0 && unlockedBadges.length === 0 ? (
            <p className="p-3 text-xs text-[var(--muted)]">Wins from competitions and study will land here.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {unlockedBadges.slice(0, 3).map((b) => (
                <li key={b} className="flex items-center gap-2.5 px-3 py-3 text-xs font-bold text-[var(--fg)]">
                  <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                  {b}
                </li>
              ))}
              {achievements.map((a) => (
                <li key={a.id} className="flex items-center gap-2.5 px-3 py-3 text-xs font-bold text-[var(--fg)]">
                  <Award className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                  <span className="truncate">{a.title}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => push('achievements')}
            className="w-full text-[11px] font-bold text-[var(--accent)] px-3 py-2.5 text-left"
          >
            See all achievements →
          </button>
        </SaCard>
      </SaSection>

      {projects.length > 0 ? (
        <SaSection eyebrow="Projects">
          <SaCard className="p-2">
            {projects.map((p) => (
              <div key={p.id} className="px-3 py-3 border-b border-[var(--border)] last:border-0">
                <p className="text-sm font-bold text-[var(--fg)]">{p.title}</p>
                {p.subtitle ? <p className="text-[11px] text-[var(--muted)] mt-0.5">{p.subtitle}</p> : null}
              </div>
            ))}
          </SaCard>
        </SaSection>
      ) : null}

      <SaSection eyebrow="School record">
        <div className="space-y-2">
          <MeLink icon={CalendarCheck} title="Attendance" meta={`${attendancePct}% overall`} onClick={() => push('attendance')} />
          <MeLink icon={BookOpen} title="Progress reports" onClick={() => push('academics')} />
          <MeLink
            icon={Users}
            title="My teachers"
            meta={`${teachers.length} teachers`}
            onClick={() => push('teachers')}
          />
          <MeLink icon={Briefcase} title="Portfolio" meta="Identity layer" onClick={() => push('portfolio')} />
          <MeLink icon={Sparkles} title="Full academic profile" onClick={() => push('profile')} />
        </div>
      </SaSection>
    </div>
  )
}

function MeLink({
  icon: Icon,
  title,
  meta,
  onClick,
}: {
  icon: typeof Award
  title: string
  meta?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-left"
    >
      <span className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-[var(--accent)]" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-[var(--fg)]">{title}</span>
        {meta ? <span className="text-[11px] text-[var(--muted)]">{meta}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 text-[var(--muted)]" aria-hidden />
    </button>
  )
}
