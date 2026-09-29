import { useOrbitStore } from '../../../store/orbitStore'
import { SaCard, SaChip, SaSection } from '../components/SaUi'

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
  'Drawing',
  'Robotics',
]

export function InterestsDetail() {
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const interests = studentProfile.interests || []

  const toggle = (interest: string) => {
    const next = interests.includes(interest)
      ? interests.filter((i) => i !== interest)
      : [...interests, interest]
    updateStudentProfile({ interests: next })
    triggerToast(interests.includes(interest) ? `Removed ${interest}` : `Added ${interest}`)
  }

  return (
    <div className="space-y-4 pb-4">
      <SaSection eyebrow="Discover" title="What would you like to explore?">
        <SaCard className="p-4">
          <div className="flex flex-wrap gap-2">
            {INTEREST_POOL.map((item) => (
              <SaChip key={item} active={interests.includes(item)} onClick={() => toggle(item)}>
                {item}
              </SaChip>
            ))}
          </div>
        </SaCard>
      </SaSection>
      <p className="text-[11px] text-[var(--muted)] px-1 leading-relaxed">
        Orbit uses light taps like these — not a giant form — to learn what to recommend in Grow.
      </p>
    </div>
  )
}
