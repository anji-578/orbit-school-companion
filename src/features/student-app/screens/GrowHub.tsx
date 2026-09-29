import { useMemo, useState } from 'react'
import { Award, Compass, Sparkles, Target, Trophy } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import type { OrbitCompetition } from '../../../types'
import { SaChip, SaPrimaryButton, SaRow, SaSection } from '../components/SaUi'
import { SaEmpty } from '../components/NestedChrome'
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

const MAX_INTERESTS = 4

const INTEREST_TO_CATEGORIES: Record<string, string[]> = {
  Technology: ['Coding', 'Quiz'],
  Coding: ['Coding'],
  Science: ['Science', 'Quiz', 'Mathematics'],
  Sports: ['Sports', 'Karate', 'Chess'],
  Cricket: ['Sports'],
  Arts: ['Drawing', 'Music'],
  Music: ['Music'],
  Debate: ['Debate', 'Public Speaking'],
  Business: ['Quiz', 'Public Speaking'],
  Photography: ['Drawing'],
}

function matchReason(comp: OrbitCompetition, interests: string[]): string | null {
  for (const interest of interests) {
    const cats = INTEREST_TO_CATEGORIES[interest] || [interest]
    if (cats.some((c) => c.toLowerCase() === comp.category.toLowerCase())) {
      return `Matches your interest in ${interest}`
    }
    if (comp.title.toLowerCase().includes(interest.toLowerCase())) {
      return `Title relates to ${interest}`
    }
  }
  return null
}

/** Phase 5 Grow — interests ≤4, honest For You, Explore taxonomy. */
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
    return competitions.filter((c) => !done.has(c.id))
  }, [competitions, enrollments])

  const forYou = useMemo(() => {
    if (interests.length === 0) {
      return openComps[0]
        ? { comp: openComps[0], reason: 'Open at your school — pick interests to personalize' as string | null }
        : null
    }
    for (const comp of openComps) {
      const reason = matchReason(comp, interests)
      if (reason) return { comp, reason }
    }
    return openComps[0]
      ? { comp: openComps[0], reason: 'Open at your school (no direct interest match yet)' as string | null }
      : null
  }, [openComps, interests])

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      updateStudentProfile({ interests: interests.filter((i) => i !== interest) })
      triggerToast(`Removed ${interest}`)
      return
    }
    if (interests.length >= MAX_INTERESTS) {
      triggerToast(`Pick up to ${MAX_INTERESTS} interests`)
      return
    }
    updateStudentProfile({ interests: [...interests, interest] })
    triggerToast(`Added ${interest}`)
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="px-0.5">
        <h1 className="font-display text-xl font-extrabold text-[var(--fg)]">Grow</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">What could you become interested in?</p>
      </div>

      {!promptDone && interests.length < 2 ? (
        <SaSection eyebrow="Discover">
          <div className="space-y-3 px-0.5">
            <p className="text-sm font-extrabold text-[var(--fg)]">What would you like to explore?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_POOL.slice(0, 6).map((item) => (
                <SaChip key={item} active={interests.includes(item)} onClick={() => toggleInterest(item)}>
                  {item}
                </SaChip>
              ))}
            </div>
            <button type="button" className="text-[11px] font-bold text-[var(--muted)]" onClick={() => setPromptDone(true)}>
              Not now
            </button>
          </div>
        </SaSection>
      ) : null}

      <SaSection eyebrow={`Your interests · ${interests.length}/${MAX_INTERESTS}`}>
        <div className="space-y-3 px-0.5">
          {interests.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">Choose up to {MAX_INTERESTS} — Orbit only recommends when it can explain why.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <SaChip key={i} active onClick={() => toggleInterest(i)}>
                  {i}
                </SaChip>
              ))}
            </div>
          )}
          {interests.length < MAX_INTERESTS ? (
            <div className="flex flex-wrap gap-2">
              {INTEREST_POOL.filter((i) => !interests.includes(i))
                .slice(0, 6)
                .map((item) => (
                  <SaChip key={item} onClick={() => toggleInterest(item)}>
                    + {item}
                  </SaChip>
                ))}
            </div>
          ) : null}
        </div>
      </SaSection>

      <SaSection eyebrow="For you">
        {forYou ? (
          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[var(--fg)] leading-snug">{forYou.comp.title}</p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  {forYou.comp.category}
                  {forYou.comp.city ? ` · ${forYou.comp.city}` : ''}
                  {forYou.comp.date ? ` · ${forYou.comp.date}` : ''}
                </p>
                {forYou.reason ? (
                  <p className="text-[11px] text-[var(--accent)] mt-2">Why: {forYou.reason}</p>
                ) : null}
              </div>
            </div>
            <SaPrimaryButton onClick={() => push('competitions')}>Explore</SaPrimaryButton>
          </div>
        ) : (
          <SaEmpty title="Nothing to recommend yet" body="When your school adds competitions, honest picks will show here." />
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
            icon={Sparkles}
            title="Challenges"
            subtitle="Quick GK quiz for XP"
            accent="#7c3aed"
            onClick={() => push('gk-quiz')}
          />
          <SaRow
            icon={Compass}
            title="Workshops"
            subtitle="Coming soon from your school"
            onClick={() => triggerToast('Workshops will appear when your school publishes them')}
          />
        </div>
      </SaSection>
    </div>
  )
}
