import { Award, Briefcase, Trophy } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { SaCard, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

/** Portfolio = auto-built identity layer from academics, skills, activities. */
export function PortfolioDetail() {
  const { push } = useStudentNav()
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)

  const sections = [
    {
      key: 'achievements',
      title: 'Achievements',
      icon: Trophy,
      items: studentProfile.achievements || [],
      empty: 'Compete or complete challenges — trophies appear here.',
    },
    {
      key: 'competitions',
      title: 'Competitions',
      icon: Award,
      items: studentProfile.competitions || [],
      empty: 'Register for a competition in Grow to start this thread.',
    },
    {
      key: 'projects',
      title: 'Projects',
      icon: Briefcase,
      items: studentProfile.projects || [],
      empty: 'Add projects from your full profile.',
    },
    {
      key: 'certs',
      title: 'Certificates',
      icon: Award,
      items: studentProfile.certifications || [],
      empty: 'Certificates you earn will collect here.',
    },
  ] as const

  return (
    <div className="space-y-5 pb-4">
      <div className="px-0.5">
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Orbit builds your portfolio from what you do — assessments, projects, competitions — so you
          aren&apos;t maintaining a résumé by hand.
        </p>
      </div>

      {unlockedBadges.length > 0 ? (
        <SaSection eyebrow="Orbit badges">
          <SaCard className="p-4 flex flex-wrap gap-2">
            {unlockedBadges.map((b) => (
              <span
                key={b}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300"
              >
                🏆 {b}
              </span>
            ))}
          </SaCard>
        </SaSection>
      ) : null}

      {sections.map((sec) => (
        <SaSection key={sec.key} eyebrow={sec.title}>
          <SaCard className="p-2">
            {sec.items.length === 0 ? (
              <p className="p-3 text-xs text-[var(--muted)]">{sec.empty}</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {sec.items.map((item) => (
                  <li key={item.id} className="px-3 py-3">
                    <p className="text-sm font-bold text-[var(--fg)]">{item.title}</p>
                    {item.subtitle ? (
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">{item.subtitle}</p>
                    ) : null}
                    {item.date ? <p className="text-[10px] text-[var(--muted)] mt-1">{item.date}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </SaCard>
        </SaSection>
      ))}

      <button
        type="button"
        onClick={() => push('profile')}
        className="text-[11px] font-bold text-[var(--accent)] px-1"
      >
        Edit full profile →
      </button>
    </div>
  )
}
