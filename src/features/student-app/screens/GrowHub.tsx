import { useMemo, useState } from 'react'
import { ArrowRight, Briefcase, ChevronRight, Compass, Sparkles, Trophy, Users } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import type { OrbitCompetition } from '../../../types'
import { SaChip, SaSection, SaViewAll } from '../components/SaUi'
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

const EXPLORE = [
  {
    key: 'interests',
    title: 'Interests',
    desc: 'Discover what you love',
    icon: Compass,
    card: 'card-category-interests',
    iconTone: 'text-category-interests-icon bg-violet-500/20',
    go: 'interests' as const,
  },
  {
    key: 'clubs',
    title: 'Clubs',
    desc: 'Join school activities',
    icon: Users,
    card: 'card-category-clubs',
    iconTone: 'text-category-clubs-icon bg-emerald-500/20',
    go: 'extracurriculars' as const,
  },
  {
    key: 'competitions',
    title: 'Competitions',
    desc: 'Challenge yourself',
    icon: Trophy,
    card: 'card-category-competitions',
    iconTone: 'text-category-competitions-icon bg-amber-500/20',
    go: 'competitions' as const,
  },
  {
    key: 'skills',
    title: 'Skills',
    desc: 'Build new abilities',
    icon: Briefcase,
    card: 'card-category-skills',
    iconTone: 'text-category-skills-icon bg-pink-500/20',
    go: 'gk-quiz' as const,
  },
]

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

export function GrowHub() {
  const { push } = useStudentNav()
  const competitions = useOrbitStore((s) => s.competitions)
  const enrollments = useOrbitStore((s) => s.competitionEnrollments)
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const [promptDone, setPromptDone] = useState(false)

  const interests = studentProfile.interests ?? []
  const openComps = useMemo(() => {
    const done = new Set(
      enrollments.filter((e) => e.status === 'participated' || e.status === 'result').map((e) => e.competitionId),
    )
    return competitions.filter((c) => !done.has(c.id))
  }, [competitions, enrollments])

  const recommended = useMemo(() => {
    const picks = studentProfile.interests ?? []
    if (picks.length === 0) return openComps.slice(0, 2)
    const matched = openComps.filter((c) => matchReason(c, picks))
    return (matched.length > 0 ? matched : openComps).slice(0, 2)
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
      <header className="relative overflow-hidden rounded-card border border-white/[0.08] bg-orbit-surface">
        <img
          src="/brand/student-motivation-banner.png"
          alt=""
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[48%] object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orbit-surface via-orbit-surface/90 to-transparent" />
        <div className="relative space-y-1 p-4 pr-[44%]">
          <h1 className="font-heading text-[1.75rem] font-bold text-white">Grow</h1>
          <p className="text-[13px] text-orbit-text-secondary">Explore. Build. Become more.</p>
        </div>
      </header>

      {!promptDone && interests.length < 2 ? (
        <SaSection eyebrow="Discover">
          <div className="orbit-card space-y-3">
            <p className="text-sm font-semibold text-white">What would you like to explore?</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_POOL.slice(0, 6).map((item) => (
                <SaChip key={item} active={interests.includes(item)} onClick={() => toggleInterest(item)}>
                  {item}
                </SaChip>
              ))}
            </div>
            <button type="button" className="text-[11px] font-semibold text-orbit-text-muted" onClick={() => setPromptDone(true)}>
              Not now
            </button>
          </div>
        </SaSection>
      ) : null}

      <SaSection eyebrow="Explore areas" action={<SaViewAll onClick={() => push('interests')} />}>
        <div className="grid grid-cols-2 gap-3">
          {EXPLORE.map(({ key, title, desc, icon: Icon, card, iconTone, go }) => (
            <button
              key={key}
              type="button"
              onClick={() => push(go)}
              className={`${card} flex min-h-[118px] flex-col items-start gap-3 text-left`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-icon ${iconTone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-heading text-sm font-bold text-white">
                  {title}
                  <ChevronRight className="h-3.5 w-3.5 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="mt-1 block text-[11px] text-orbit-text-secondary">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </SaSection>

      <SaSection eyebrow="Recommended for you" action={<SaViewAll onClick={() => push('competitions')} />}>
        {recommended.length === 0 ? (
          <SaEmpty title="Nothing to recommend yet" body="When your school adds competitions, honest picks will show here." />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommended.map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => push('competitions')}
                className="orbit-card-interactive relative w-[260px] shrink-0 overflow-hidden text-left"
              >
                <img
                  src="/brand/orbit-home-hero.jpg"
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orbit-surface via-orbit-surface/85 to-orbit-surface/40" />
                <div className="relative space-y-3">
                  <span className="inline-flex rounded-full bg-orbit-primary/20 px-2.5 py-1 text-[10px] font-bold text-orbit-accent">
                    {comp.category || 'Skill'}
                  </span>
                  <div>
                    <p className="font-heading text-sm font-bold text-white">{comp.title}</p>
                    <p className="mt-1 text-[11px] text-orbit-text-secondary">
                      {comp.city || 'School'}
                      {comp.date ? ` · ${comp.date}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-orbit-text-muted">{comp.category || 'Open'}</p>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orbit-primary shadow-glow-primary">
                      <ArrowRight className="h-4 w-4 text-white" strokeWidth={1.75} aria-hidden />
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
          <p className="text-xs text-orbit-text-secondary">No open opportunities yet.</p>
        ) : (
          <div className="orbit-card space-y-1 p-2">
            {openComps.slice(0, 3).map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => push('competitions')}
                className="flex w-full items-center gap-3 rounded-icon px-2 py-3 text-left hover:bg-white/[0.03]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-icon bg-amber-500/15">
                  <Trophy className="h-5 w-5 text-amber-400" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{comp.title}</span>
                  <span className="mt-0.5 block text-[11px] text-orbit-text-secondary">
                    {comp.date ? `Register by ${comp.date}` : comp.category}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-orbit-text-muted">{comp.date || 'Soon'}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
              </button>
            ))}
          </div>
        )}
      </SaSection>

      <SaSection eyebrow="Your journey" action={<SaViewAll onClick={() => push('interests')} />}>
        <div className="orbit-card flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-icon bg-violet-500/20">
            <Sparkles className="h-5 w-5 text-violet-300" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Keep growing</p>
            <p className="mt-0.5 text-[11px] text-orbit-text-secondary">
              {interests.length}/{MAX_INTERESTS} interests · {unlockedBadges.length} badges
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border-2 border-orbit-primary/50 text-center">
            <span className="text-xs font-bold text-orbit-primary">
              {goalsDone}/5
            </span>
            <span className="text-[8px] text-orbit-text-muted">goals</span>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-orbit-text-muted" strokeWidth={1.75} aria-hidden />
        </div>
      </SaSection>
    </div>
  )
}
