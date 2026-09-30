import { useMemo } from 'react'
import { Award, Briefcase, ChevronRight, FileText, GraduationCap, Trophy } from 'lucide-react'
import { useAuthStore } from '../../../auth/authStore'
import { useOrbitStore } from '../../../store/orbitStore'
import { childClassLabel, childDisplayName } from '../../../lib/linkedStudent'
import { SaSection } from '../components/SaUi'
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

/** Phase 6 Me — identity first; admin under School records. */
export function MeHub() {
  const { push } = useStudentNav()
  const session = useAuthStore((s) => s.session)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const totalXp = useOrbitStore((s) => s.totalXp)

  const name = childDisplayName(linkedStudent, session?.displayName || studentProfile.name)
  const grade = childClassLabel(linkedStudent) || studentProfile.grade
  const school = studentProfile.school
  const streak = presentStreak(attendanceRecords)

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
    <div className="space-y-5 pb-6">
      <div className="px-0.5 space-y-3">
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
            <p className="text-[11px] text-[var(--muted)] mt-1">
              {streak > 0 ? `${streak}-day presence streak` : 'Building your presence'}
              {totalXp > 0 ? ` · ${totalXp} XP` : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => push('portfolio')}
          className="text-[11px] font-bold text-[var(--accent)] inline-flex items-center gap-1"
        >
          Open portfolio <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <SaSection eyebrow="Learning & skills">
        <ul className="divide-y divide-[var(--border)]">
          {learning.map((row) => {
            const trend = trendLabel(row.pct || 70)
            return (
              <li key={row.subject}>
                <button
                  type="button"
                  onClick={() => push('subject', { subject: row.subject }, row.subject)}
                  className="w-full flex items-center justify-between gap-3 py-3 text-left px-0.5"
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
      </SaSection>

      <SaSection eyebrow="Interests">
        <button type="button" onClick={() => push('interests')} className="w-full text-left px-0.5 py-1">
          {(studentProfile.interests || []).length === 0 ? (
            <p className="text-xs text-[var(--muted)]">Add interests in Grow — they show up here.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {studentProfile.interests.slice(0, 4).map((i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)]"
                >
                  {i}
                </span>
              ))}
            </div>
          )}
        </button>
      </SaSection>

      <SaSection eyebrow="Achievements">
        {achievements.length === 0 && unlockedBadges.length === 0 ? (
          <p className="text-xs text-[var(--muted)] px-0.5">Wins from competitions and study will land here.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {unlockedBadges.slice(0, 3).map((b) => (
              <li key={b} className="flex items-center gap-2.5 py-3 text-xs font-bold text-[var(--fg)] px-0.5">
                <Trophy className="h-4 w-4 text-amber-500" aria-hidden />
                {b}
              </li>
            ))}
            {achievements.map((a) => (
              <li key={a.id} className="flex items-center gap-2.5 py-3 text-xs font-bold text-[var(--fg)] px-0.5">
                <Award className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                <span className="truncate">{a.title}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => push('achievements')}
          className="text-[11px] font-bold text-[var(--accent)] px-0.5 pt-2"
        >
          See all achievements →
        </button>
      </SaSection>

      {projects.length > 0 ? (
        <SaSection eyebrow="Projects">
          <div className="space-y-3 px-0.5">
            {projects.map((p) => (
              <div key={p.id}>
                <p className="text-sm font-bold text-[var(--fg)]">{p.title}</p>
                {p.subtitle ? <p className="text-[11px] text-[var(--muted)] mt-0.5">{p.subtitle}</p> : null}
              </div>
            ))}
          </div>
        </SaSection>
      ) : null}

      <SaSection eyebrow="More">
        <div className="divide-y divide-[var(--border)]">
          <MeLink icon={Briefcase} title="Portfolio" meta="Your growth story" onClick={() => push('portfolio')} />
          <MeLink
            icon={FileText}
            title="School records"
            meta="Attendance, reports, teachers"
            onClick={() => push('school-records')}
          />
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
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 py-3.5 text-left px-0.5">
      <span className="h-9 w-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-[var(--fg)]">{title}</span>
        {meta ? <span className="text-[11px] text-[var(--muted)]">{meta}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 text-[var(--muted)]" aria-hidden />
    </button>
  )
}
