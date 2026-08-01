import type { SyllabusChapter } from '../types'

/** Structured tutor answer — keeps student-facing AI consistent and auditable. */
export type TutorAnswer = {
  title: string
  explanation: string[]
  example?: string
  formula?: string
  checkYourself: string
  confidence: 'high' | 'medium' | 'low'
  groundedInSyllabus: boolean
  caveats: string[]
  refuse?: boolean
  refuseReason?: string
}

export const TUTOR_REFUSAL_TOPICS =
  'Do NOT answer medical diagnosis, mental-health crises, legal advice, exam cheating (provide final board answers without teaching), or requests unrelated to school learning.'

export const TUTOR_SYSTEM_BASE = [
  'You are Orbit AI, a careful school tutor for Indian Class 6–12 students.',
  'Education cannot tolerate made-up facts. Prefer "I am not sure" over guessing.',
  TUTOR_REFUSAL_TOPICS,
  'Never invent marks, ranks, attendance, fees, or official school policy.',
  'Never claim something is from the school syllabus unless it appears in CONTEXT.',
  'Use simple English suitable for secondary students. Telugu words only if the student asks.',
  'If CONTEXT is provided, ground your explanation in that CONTEXT. Quote topic titles when relevant.',
  'If CONTEXT is empty or insufficient, set confidence to "low" and say the student should verify with textbook/teacher.',
  'Respond with ONLY strict JSON (no markdown fences) matching:',
  '{',
  '  "title": string,',
  '  "explanation": string[],',
  '  "example": string,',
  '  "formula": string,',
  '  "checkYourself": string,',
  '  "confidence": "high" | "medium" | "low",',
  '  "groundedInSyllabus": boolean,',
  '  "caveats": string[],',
  '  "refuse": boolean,',
  '  "refuseReason": string',
  '}',
  'explanation: 2–5 short bullet strings. example/formula may be "".',
  'checkYourself: one short self-check question (not a full quiz).',
  'caveats: 0–3 honesty notes (e.g. "Verify with textbook diagram").',
].join(' ')

export const PAPER_COACH_GUARDRAILS = [
  'Coach mode only — practice feedback, never official grading.',
  'Do not invent marks out of 50 or claim board-exam certainty.',
  'If the photo is unreadable, say so and set confidence below 50.',
  'Base comments only on what is visible on the sheet; do not invent missing steps as fact.',
  'If unsure what the question was, state that uncertainty in summary.',
].join(' ')

/** Pull short syllabus snippets that match the student question (grounding). */
export function buildSyllabusContext(question: string, curriculum: SyllabusChapter[], maxChars = 1800): string {
  const q = question.toLowerCase()
  const tokens = q
    .split(/[^a-z0-9+]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length > 3)

  const scored = curriculum
    .map((ch) => {
      const hay = `${ch.title} ${ch.subject} ${(ch.subtopics ?? []).map((s) => `${s.title} ${s.noteName ?? ''}`).join(' ')}`.toLowerCase()
      let score = 0
      for (const tok of tokens) {
        if (hay.includes(tok)) score += 1
      }
      if (q.includes(ch.subject.toLowerCase())) score += 2
      return { ch, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  if (!scored.length) return ''

  const parts: string[] = ['SYLLABUS CONTEXT (use only this as school-specific grounding):']
  for (const { ch } of scored) {
    const done = (ch.subtopics ?? []).filter((s) => s.done).map((s) => s.title)
    const open = (ch.subtopics ?? []).filter((s) => !s.done).map((s) => s.title)
    const notes = (ch.subtopics ?? [])
      .filter((s) => s.noteName)
      .map((s) => `${s.title} → note:${s.noteName}`)
    parts.push(
      [
        `Chapter: ${ch.title} (${ch.subject})`,
        done.length ? `Covered: ${done.slice(0, 6).join('; ')}` : null,
        open.length ? `Upcoming: ${open.slice(0, 6).join('; ')}` : null,
        notes.length ? `Teacher notes on file: ${notes.slice(0, 4).join('; ')}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  const text = parts.join('\n\n')
  return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text
}

export function parseTutorAnswer(raw: string): TutorAnswer | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned) as Partial<TutorAnswer>
    if (!parsed || typeof parsed.title !== 'string') return null
    const explanation = Array.isArray(parsed.explanation)
      ? parsed.explanation.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 6)
      : []
    if (!explanation.length && !parsed.refuse) return null

    const confidence =
      parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low'
        ? parsed.confidence
        : 'low'

    return {
      title: parsed.title.trim() || 'Orbit tutor',
      explanation,
      example: typeof parsed.example === 'string' ? parsed.example.trim() : '',
      formula: typeof parsed.formula === 'string' ? parsed.formula.trim() : '',
      checkYourself:
        typeof parsed.checkYourself === 'string' && parsed.checkYourself.trim()
          ? parsed.checkYourself.trim()
          : 'Can you explain this idea in your own words to a classmate?',
      confidence,
      groundedInSyllabus: Boolean(parsed.groundedInSyllabus),
      caveats: Array.isArray(parsed.caveats)
        ? parsed.caveats.filter((x): x is string => typeof x === 'string').slice(0, 3)
        : [],
      refuse: Boolean(parsed.refuse),
      refuseReason: typeof parsed.refuseReason === 'string' ? parsed.refuseReason.trim() : '',
    }
  } catch {
    return null
  }
}

/** Fallback structured answer when model fails — still honest, never invents syllabus facts. */
export function offlineTutorAnswer(question: string): TutorAnswer {
  const q = question.toLowerCase()
  if (q.includes('kirchhoff') || q.includes('kirchoff')) {
    return {
      title: 'Kirchhoff’s laws (quick)',
      explanation: [
        'KCL: current into a junction equals current out.',
        'KVL: voltages around a closed loop sum to zero.',
        'Use KCL at nodes and KVL on loops when solving circuits.',
      ],
      example: 'At a junction, 3 A in and 1 A out on one branch ⇒ other branch carries 2 A out.',
      formula: 'Σ I_in = Σ I_out ··· Σ V_loop = 0',
      checkYourself: 'In one sentence, what does KCL conserve?',
      confidence: 'medium',
      groundedInSyllabus: false,
      caveats: ['Offline answer — verify with your Physics textbook diagram.'],
    }
  }
  return {
    title: 'Let’s learn carefully',
    explanation: [
      'I could not reach a live AI model, so this is a careful offline reply.',
      'Break the question into: what is given, what to find, which formula/topic.',
      'Check your class notes or teacher PDF before treating any AI answer as final.',
    ],
    example: '',
    formula: '',
    checkYourself: 'What is one fact in your question you are already sure about?',
    confidence: 'low',
    groundedInSyllabus: false,
    caveats: ['Offline / ungrounded — ask your teacher to confirm.'],
  }
}

export function tutorAnswerToMarkdown(answer: TutorAnswer): string {
  if (answer.refuse) {
    return [
      `## ${answer.title || 'Cannot help with that'}`,
      '',
      answer.refuseReason || 'Please ask a school learning question, or talk to a teacher/parent for this topic.',
    ].join('\n')
  }
  const lines = [`## ${answer.title}`, '', ...answer.explanation.map((b) => `- ${b}`)]
  if (answer.example) {
    lines.push('', '### Example', answer.example)
  }
  if (answer.formula) {
    lines.push('', '### Formula', `$$${answer.formula}$$`)
  }
  lines.push('', '### Check yourself', answer.checkYourself)
  if (answer.caveats.length) {
    lines.push('', '### Important', ...answer.caveats.map((c) => `- ${c}`))
  }
  return lines.join('\n')
}
