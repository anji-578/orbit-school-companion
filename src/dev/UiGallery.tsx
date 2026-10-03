import { useEffect, useState } from 'react'
import {
  AchievementBadge,
  DateChip,
  EmptyState,
  FloatingChip,
  HeroBanner,
  ICON,
  IconTile,
  ProgressBar,
  ProgressRing,
  SectionHeader,
  Skeleton,
  StatTile,
  TagChip,
} from '@/shared/ui/orbit'

const TELUGU = 'నేను నా పాఠశాల పని పూర్తి చేయాలి మరియు రేపటి పరీక్షకు సిద్ధం కావాలి'

/** DEV-only primitive gallery. */
export function UiGallery() {
  const q = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const [theme, setTheme] = useState<'dark' | 'light'>(q.get('theme') === 'light' ? 'light' : 'dark')
  const [scale, setScale] = useState(q.get('scale') === '160' ? 160 : 100)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return (
    <div
      className="orbit-root min-h-dvh bg-o-bg p-5 text-o-text"
      data-theme={theme}
      style={{ fontSize: `${scale}%` }}
    >
      <div className="mx-auto max-w-lg space-y-8 pb-16">
        <header className="space-y-3">
          <p className="o-label">Orbit UI kit</p>
          <h1 className="font-display text-2xl font-extrabold">/dev/ui gallery</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="o-btn-primary o-focus"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              Theme: {theme}
            </button>
            <button
              type="button"
              className="o-focus min-h-11 rounded-button border border-o-border px-4"
              onClick={() => setScale(100)}
            >
              100%
            </button>
            <button
              type="button"
              className="o-focus min-h-11 rounded-button border border-o-border px-4"
              onClick={() => setScale(160)}
            >
              160%
            </button>
          </div>
        </header>

        <section data-testid="gallery-primitives" className="space-y-4">
          <SectionHeader title="Primitives" first />
          <div className="flex flex-wrap gap-3">
            <IconTile icon={ICON.item.class} tone="blue" label="Class" />
            <IconTile icon={ICON.item.homework} tone="green" label="Homework" />
            <IconTile glyph="π" tone="math" label="Mathematics" />
            <ProgressRing value={2} total={8} label="Worksheet progress" />
            <TagChip label="CLASS" tone="blue" />
            <DateChip date={new Date('2026-10-10T12:00:00+05:30')} />
          </div>
          <StatTile icon={ICON.stat.streak} tone="purple" value={4} label="Day streak" />
          <ProgressBar value={62} label="Syllabus covered" height={6} />
          <AchievementBadge icon={ICON.badge.curious} light="#8A5CFF" dark="#5A2FD6" label="Curious Mind" />
          <AchievementBadge
            icon={ICON.badge.curious}
            light="#8A5CFF"
            dark="#5A2FD6"
            label="Curious Mind"
            locked
          />
          <FloatingChip icon={ICON.tab.learn} line1="Learn" line2="Today" tone="blue" />
        </section>

        <section data-testid="gallery-copy">
          <SectionHeader title="Long copy" />
          <p className="text-[14px] leading-relaxed text-o-muted">
            A new day to learn, grow and do something amazing — keep going even when the worksheet feels long
            and the afternoon class is still ahead of you.
          </p>
          <p className="mt-3 text-[14px] leading-[1.5] text-o-text" lang="te">
            {TELUGU}
          </p>
        </section>

        <section data-testid="gallery-empty">
          <SectionHeader title="Empty" />
          <EmptyState
            art="/art/caught-up.svg"
            title="You're all caught up!"
            body="Want to try a quick quiz or explore something new?"
          />
        </section>

        <section data-testid="gallery-loading">
          <SectionHeader title="Loading" />
          <div className="o-card space-y-3 p-4" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </section>

        <section data-testid="gallery-error">
          <SectionHeader title="Error" />
          <EmptyState
            art="/art/caught-up.svg"
            title="Something went wrong"
            body="Try again in a moment. Your work is safe."
          />
        </section>

        <HeroBanner
          title="Learn"
          subtitle="Your learning journey, made simple."
          artSrc="/art/hero-learn.svg"
        />
      </div>
    </div>
  )
}
