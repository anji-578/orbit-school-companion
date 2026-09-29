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

const MAX_INTERESTS = 4

export function InterestsDetail() {
  const studentProfile = useOrbitStore((s) => s.studentProfile)
  const updateStudentProfile = useOrbitStore((s) => s.updateStudentProfile)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const interests = studentProfile.interests || []

  const toggle = (interest: string) => {
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
    <div className="space-y-4 pb-4">
      <SaSection eyebrow="Discover" title={`What would you like to explore? (${interests.length}/${MAX_INTERESTS})`}>
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
        Cap is {MAX_INTERESTS} so Grow recommendations stay honest and focused.
      </p>
    </div>
  )
}
