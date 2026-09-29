import { useMemo, useState } from 'react'
import { Award, Compass, Sparkles, Target, Trophy } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { SaCard, SaChip, SaPrimaryButton, SaRow, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

const INTEREST_POOL = [
  'Technology',
  'Sports',
  'Arts',
  'Science',
  'Business',
  'Music',
  'Debate',
  'Coding',
  'Photography',
  'Cricket',
]

/** Grow = interests + opportunities — not another school module list. */
export function GrowHub() {
  const { push } = useStudentNav()
  const competitions = useOrbitStore((s) => s.competitions)
  const enrollments = useOrbitStore((s) => s.competitionEnrollments)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [promptDone, setPromptDone] = useState(false)

  const interests = studentProfile.interests || []
  const openComps = useMemo(() => {
    const done = new Set(
      enrollments.filter((e) => e.status === 'participated' || e.status === 'result').map((e) => e.competitionId),
    )
    return competitions.filter((c) => !done.has(c.id)).slice(0, 4)
  }, [competitions, enrollments])
  const featured = openComps[0]

  const toggleInterest = (interest: string) => {
    const next = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest]
    updateStudentProfile({ interests: next })
    triggerToast(interests.includes(interest) ? `Removed ${interest}` : `Added ${interest}`)
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="px-0.5">
        <h1 className="font-display text-xl font-extrabold text-[var(--fg)]">Grow</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">What could you become interested in?</p>
      </div>

      {/* Lightweight discovery */}
      {!promptDone && interests.length < 2 ? (
        <SaSection eyebrow="Discover">
          <SaCard className="p-4 space-y-3">
            <p className="text-sm font-extrabold text-[var(--fg)]">What would you like to explore?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_POOL.slice(0, 6).map((item) => (
                <SaChip key={item} active={interests.includes(item)} onClick={() => toggleInterest(item)}>
                  {item}
                </SaChip>
              ))}
            </div>
            <button
              type="button"
              className="text-[11px] font-bold text-[var(--muted)]"
              onClick={() => setPromptDone(true)}
            >
              Not now
            </button>
          </SaCard>
        </SaSection>
      ) : null}

      <SaSection eyebrow="Your interests">
        <SaCard className="p-4 space-y-3">
          {interests.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">Tap topics below — Orbit learns as you go.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <SaChip key={i} active onClick={() => toggleInterest(i)}>
                  {i}
                </SaChip>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {INTEREST_POOL.filter((i) => !interests.includes(i))
              .slice(0, 5)
              .map((item) => (
                <SaChip key={item} onClick={() => toggleInterest(item)}>
                  + {item}
                </SaChip>
              ))}
          </div>
        </SaCard>
      </SaSection>

      <SaSection eyebrow="Recommended for you">
        {featured ? (
          <SaCard className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[var(--fg)] leading-snug">{featured.title}</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  {featured.category}
                  {featured.city ? ` · ${featured.city}` : ''}
                  {featured.date ? ` · ${featured.date}` : ''}
                </p>
                {interests.length > 0 ? (
                  <p className="text-[11px] text-[var(--accent)] mt-2">
                    Why: matches your interest in {interests[0]}
                  </p>
                ) : null}
              </div>
            </div>
            <SaPrimaryButton onClick={() => push('competitions')}>Explore</SaPrimaryButton>
          </SaCard>
        ) : (
          <SaCard className="p-4">
            <p className="text-xs text-[var(--muted)]">New challenges will show up here as your school adds them.</p>
          </SaCard>
        )}
      </SaSection>

      <SaSection eyebrow="Explore">
        <div className="space-y-2">
          <SaRow
            icon={Award}
            title="Competitions"
            subtitle={`${openComps.length} open`}
            accent="#d97706"
            onClick={() => push('competitions')}
          />
          <SaRow
            icon={Target}
            title="Clubs & activities"
            subtitle="Sports, arts, and more"
            accent="#059669"
            onClick={() => push('extracurriculars')}
          />
          <SaRow
            icon={Compass}
            title="Interests"
            subtitle="Shape what Orbit recommends"
            onClick={() => push('interests')}
          />
          <SaRow
            icon={Sparkles}
            title="Quick challenge"
            subtitle="GK quiz for XP"
            accent="#7c3aed"
            onClick={() => push('gk-quiz')}
          />
        </div>
      </SaSection>
    </div>
  )
}
