import { useMemo, useState } from 'react'
import { useOrbitStore } from '../../../store/orbitStore'
import type { OrbitCompetition } from '../../../types'
import { SaChip, SaPrimaryButton, SaSection, SaViewAll } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import {
  DateChip,
  EmptyState,
  HeroBanner,
  ICON,
  IconTile,
  ProgressRing,
  TagChip,
  formatDueLabel,
  isPastDate,
  parseFlexibleDate,
} from '@/shared/ui/orbit'

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

const EXPLORE = [
  {
    title: 'Interests',
    desc: 'Discover what you love',
    icon: ICON.grow.interests,
    tone: 'purple' as const,
    from: '#1C1438',
    to: '#0E0C22',
    go: 'interests' as const,
  },
  {
    title: 'Clubs',
    desc: 'Join school activities',
    icon: ICON.grow.clubs,
    tone: 'green' as const,
    from: '#0C2621',
    to: '#081614',
    go: 'extracurriculars' as const,
  },
  {
    title: 'Competitions',
    desc: 'Challenge yourself',
    icon: ICON.grow.competitions,
    tone: 'orange' as const,
    from: '#2B1A12',
    to: '#140D0A',
    go: 'competitions' as const,
  },
  {
    title: 'Skills',
    desc: 'Build new abilities',
    icon: ICON.grow.skills,
    tone: 'pink' as const,
    from: '#2B1224',
    to: '#140A12',
    go: 'gk-quiz' as const,
  },
]

function matchReason(comp: OrbitCompetition, interests: string[]): string | null {
  for (const interest of interests) {
    const cats = INTEREST_TO_CATEGORIES[interest] || [interest]
    if (cats.some((c) => c.toLowerCase() === comp.category.toLowerCase())) {
      return `Why: you picked ${interest}`
    }
    if (comp.title.toLowerCase().includes(interest.toLowerCase())) {
      return `Why: matches ${interest}`
    }
  }
  return null
}

export function GrowHub() {
  const { push } = useStudentNav()
  const competitions = useOrbitStore((s) => s.competitions)
  const enrollments = useOrbitStore((s) => s.competitionEnrollments)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const [promptDone, setPromptDone] = useState(false)
  const Arrow = ICON.chrome.arrow
  const Chevron = ICON.chrome.chevron

  const interests = studentProfile.interests ?? []
  const openComps = useMemo(() => {
    const done = new Set(
      enrollments
        .filter((e) => e.status === 'participated' || e.status === 'result')
        .map((e) => e.competitionId),
    )
    return competitions.filter((c) => !done.has(c.id) && !isPastDate(c.date))
  }, [competitions, enrollments])

  const recommended = useMemo(() => {
    const picks = studentProfile.interests ?? []
    const scored = openComps.map((comp) => ({
      comp,
      reason: picks.length ? matchReason(comp, picks) : null,
    }))
    const matched = scored.filter((x) => x.reason)
    const list = (
      matched.length > 0 ? matched : scored.map((x) => ({ ...x, reason: 'Open at your school' }))
    ).slice(0, 2)
    return list
  }, [openComps, studentProfile.interests])

  const goalsDone = Math.min(5, interests.length + unlockedBadges.length)

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
    <div className="space-y-6 pb-8">
      <HeroBanner title="Grow" subtitle="Explore. Build. Become more." artSrc="/art/hero-grow.svg" />

      {!promptDone && interests.length < 2 ? (
        <SaSection eyebrow="Discover" first>
          <div className="o-card space-y-3 p-4">
            <p className="text-sm font-semibold text-o-text">What would you like to explore?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_POOL.slice(0, 6).map((item) => (
                <SaChip key={item} active={interests.includes(item)} onClick={() => toggleInterest(item)}>
                  {item}
                </SaChip>
              ))}
            </div>
            <button
              type="button"
              className="o-focus min-h-11 text-[13px] font-semibold text-o-muted"
              onClick={() => setPromptDone(true)}
            >
              Not now
            </button>
          </div>
        </SaSection>
      ) : null}

      <SaSection eyebrow="Explore areas" action={<SaViewAll onClick={() => push('interests')} />}>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {EXPLORE.map(({ title, desc, icon, tone, from, to, go }) => (
            <button
              key={title}
              type="button"
              onClick={() => push(go)}
              className="o-focus snap-start flex w-[138px] shrink-0 flex-col gap-3 rounded-card border border-o-border p-3 text-left active:scale-[0.98]"
              style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
            >
              <IconTile icon={icon} tone={tone} size="lg" />
              <span className="font-display text-sm font-bold text-o-text">{title}</span>
              <span className="text-[11px] text-o-muted">{desc}</span>
            </button>
          ))}
        </div>
      </SaSection>

      <SaSection eyebrow="Recommended for you" action={<SaViewAll onClick={() => push('competitions')} />}>
        {recommended.length === 0 ? (
          <EmptyState
            art="/art/caught-up.svg"
            title="Nothing to recommend yet"
            body="When your school adds competitions, honest picks will show here."
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommended.map(({ comp, reason }) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => push('competitions')}
                className="o-card o-focus w-[268px] shrink-0 overflow-hidden p-0 text-left active:scale-[0.98]"
              >
                <div
                  className="h-[118px] w-full"
                  style={{ background: 'linear-gradient(135deg, var(--o-bg-glow), var(--o-surface-2))' }}
                />
                <div className="space-y-2 p-3">
                  <TagChip label={comp.category || 'Skill'} tone="blue" />
                  <p className="font-display text-sm font-bold text-o-text">{comp.title}</p>
                  <p className="text-[12px] text-o-muted line-clamp-1">{comp.description || comp.city}</p>
                  <p className="text-[12px] text-o-primary">{reason}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-o-muted">
                      {comp.date ? formatDueLabel(comp.date) : 'Open'} · {comp.participantCount} joined
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-o-primary shadow-glow">
                      <Arrow className="h-4 w-4 text-white" strokeWidth={1.75} aria-hidden />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Upcoming opportunities" action={<SaViewAll onClick={() => push('competitions')} />}>
        {openComps.length === 0 ? (
          <EmptyState
            compact
            art="/art/caught-up.svg"
            title="No open opportunities"
            body="New clubs and competitions will appear here."
          />
        ) : (
          <div className="o-card divide-y divide-o-border p-1">
            {openComps.slice(0, 3).map((comp) => {
              const d = parseFlexibleDate(comp.date)
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => push('competitions')}
                  className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left active:scale-[0.98]"
                >
                  <IconTile icon={ICON.grow.competitions} tone="orange" size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-o-text">{comp.title}</span>
                    <span className="mt-0.5 block text-[12px] text-o-muted">
                      {comp.date ? `Register by ${formatDueLabel(comp.date)}` : comp.category}
                    </span>
                  </span>
                  {d ? <DateChip date={d} /> : null}
                  <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
                </button>
              )
            })}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Your journey">
        <div className="o-card flex items-center gap-3 p-4">
          <IconTile icon={ICON.grow.journey} tone="purple" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-o-text">Keep growing</p>
            <p className="mt-0.5 text-[12px] text-o-muted">
              {interests.length}/{MAX_INTERESTS} interests · {unlockedBadges.length} badges
            </p>
          </div>
          <ProgressRing value={goalsDone} total={5} size={56} label="Growth goals" />
        </div>
      </SaSection>

      {interests.length > 0 ? (
        <div className="flex justify-center">
          <SaPrimaryButton onClick={() => push('interests')}>Manage interests</SaPrimaryButton>
        </div>
      ) : null}
    </div>
  )
}
