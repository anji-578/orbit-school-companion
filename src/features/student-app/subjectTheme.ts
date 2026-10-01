/** Map subject display names to Orbit design-system card classes. */

export type SubjectThemeKey = 'math' | 'science' | 'chem' | 'english' | 'default'

const THEMES: Record<SubjectThemeKey, { card: string; accent: string; label: string }> = {
  math: { card: 'card-math', accent: '#3B82F6', label: 'π' },
  science: { card: 'card-science', accent: '#10B981', label: 'Sc' },
  chem: { card: 'card-chem', accent: '#F97316', label: 'Ch' },
  english: { card: 'card-english', accent: '#F43F5E', label: 'En' },
  default: { card: 'orbit-card-interactive', accent: '#1E7BFF', label: '' },
}

export function subjectTheme(subject: string) {
  const s = subject.toLowerCase()
  if (s.includes('math')) return THEMES.math
  if (s.includes('chem')) return THEMES.chem
  if (s.includes('science') || s.includes('bio') || s.includes('physics')) return THEMES.science
  if (s.includes('english') || s.includes('language')) return THEMES.english
  return THEMES.default
}
