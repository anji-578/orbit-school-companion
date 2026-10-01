import { ICON, type SubjectKey } from './icons'
import type { Tone } from './IconTile'

/** Presentation mapping: canonical subject key for icons/gradients. */
export function canonicalSubjectKey(raw: string): SubjectKey {
  const s = raw.trim().toLowerCase()
  if (s.includes('math')) return 'math'
  if (s.includes('chem')) return 'chemistry'
  if (s.includes('phys')) return 'physics'
  if (s.includes('science') || s.includes('bio')) return 'science'
  if (s.includes('english') || s.includes('language') || s.includes('hindi') || s.includes('telugu')) {
    return s.includes('english') ? 'english' : 'languages'
  }
  if (s.includes('social') || s.includes('history') || s.includes('geo')) return 'social'
  return 'default'
}

export function subjectTone(raw: string): Tone {
  const key = canonicalSubjectKey(raw)
  if (key === 'math') return 'math'
  if (key === 'science' || key === 'physics') return 'science'
  if (key === 'chemistry') return 'chemistry'
  if (key === 'english' || key === 'languages') return 'english'
  return 'blue'
}

export function subjectIcon(raw: string) {
  const key = canonicalSubjectKey(raw)
  return ICON.subject[key] ?? ICON.subject.default
}

/** Display label: collapse "Chemistry Lab" → "Chemistry" when only a lab suffix differs. */
export function subjectDisplayName(raw: string): string {
  const trimmed = raw.trim()
  if (/^chemistry(\s+lab)?$/i.test(trimmed)) return 'Chemistry'
  return trimmed
}

export function subjectCardGradient(raw: string): string {
  const key = canonicalSubjectKey(raw)
  if (key === 'math') return 'linear-gradient(160deg, var(--o-math-from), var(--o-math-to))'
  if (key === 'science' || key === 'physics')
    return 'linear-gradient(160deg, var(--o-sci-from), var(--o-sci-to))'
  if (key === 'chemistry') return 'linear-gradient(160deg, var(--o-chem-from), var(--o-chem-to))'
  if (key === 'english' || key === 'languages')
    return 'linear-gradient(160deg, var(--o-eng-from), var(--o-eng-to))'
  return 'linear-gradient(160deg, var(--o-surface-2), var(--o-surface))'
}

export function subjectAccent(raw: string): string {
  const key = canonicalSubjectKey(raw)
  if (key === 'math') return 'var(--o-math-accent)'
  if (key === 'science' || key === 'physics') return 'var(--o-sci-accent)'
  if (key === 'chemistry') return 'var(--o-chem-accent)'
  if (key === 'english' || key === 'languages') return 'var(--o-eng-accent)'
  return 'var(--o-primary)'
}
