import { remediationTemplates } from '../data/demo'
import type { PaperCoachInsight, ScanTarget } from '../types'
import { askOrbitAiVision } from './gemini'

const COACH_SYSTEM = [
  'You are Orbit AI, a patient school paper coach for Class 9–12 students in India.',
  'You receive a photo of a student answer sheet. There is NO official answer key.',
  'Coach mode only: judge answer quality, clarity, method, and likely misconceptions.',
  'Never invent exact marks out of 50 unless clearly written on the paper.',
  'If handwriting is unreadable, say so in summary and lower confidence.',
  'Respond with ONLY strict JSON matching this schema (no markdown fences):',
  '{',
  '  "title": string,',
  '  "subject": string,',
  '  "overallQuality": "strong" | "mixed" | "needs_work",',
  '  "confidence": number,',
  '  "summary": string,',
  '  "workingWell": string[],',
  '  "needsImprovement": string[],',
  '  "flaggedWeakness": string,',
  '  "nextSteps": string[],',
  '  "checkQuestion": string,',
  '  "checkOptions": string[],',
  '  "checkAnswerIndex": number',
  '}',
  'workingWell / needsImprovement / nextSteps: 2–4 short bullets each.',
  'checkOptions: exactly 4 options. checkAnswerIndex is 0-based.',
  'confidence: 0–100 integer.',
].join(' ')

const SUBJECT_LABEL: Record<ScanTarget, string> = {
  chemistry: 'Chemistry',
  mathematics: 'Mathematics',
  science: 'Science',
  english: 'English',
  physics: 'Physics',
}

const SUBJECT_FOCUS: Record<ScanTarget, string> = {
  chemistry: 'Chemistry / Science lab',
  mathematics: 'Mathematics',
  science: 'General Science / Biology',
  english: 'English language',
  physics: 'Physics',
}

function fallbackInsight(target: ScanTarget): PaperCoachInsight {
  const tpl = remediationTemplates[target]
  return {
    title: tpl.title,
    subject: SUBJECT_LABEL[target],
    overallQuality: 'mixed',
    confidence: tpl.confidence,
    summary: tpl.analysisText,
    workingWell: ['Shows attempt structure on the sheet', 'Understands parts of the core idea'],
    needsImprovement: [tpl.flaggedWeakness, 'Needs clearer working steps on paper'],
    flaggedWeakness: tpl.flaggedWeakness,
    nextSteps: [
      'Re-read the flagged concept with a real-world analogy',
      'Solve 3 similar practice questions',
      'Re-scan after practice for progress check',
    ],
    checkQuestion: tpl.validationQuestion,
    checkOptions: [...tpl.options],
    checkAnswerIndex: tpl.correctIndex,
    model: tpl.modelEscalation,
    source: 'offline',
  }
}

function parseInsight(raw: string, target: ScanTarget): PaperCoachInsight | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')
    const parsed = JSON.parse(cleaned) as Partial<PaperCoachInsight>
    if (!parsed || typeof parsed.summary !== 'string') return null
    const workingWell = Array.isArray(parsed.workingWell)
      ? parsed.workingWell.filter((x): x is string => typeof x === 'string').slice(0, 4)
      : []
    const needsImprovement = Array.isArray(parsed.needsImprovement)
      ? parsed.needsImprovement.filter((x): x is string => typeof x === 'string').slice(0, 4)
      : []
    const nextSteps = Array.isArray(parsed.nextSteps)
      ? parsed.nextSteps.filter((x): x is string => typeof x === 'string').slice(0, 4)
      : []
    const checkOptions = Array.isArray(parsed.checkOptions)
      ? parsed.checkOptions.filter((x): x is string => typeof x === 'string').slice(0, 4)
      : []
    if (workingWell.length < 1 || needsImprovement.length < 1 || checkOptions.length < 2) return null

    const quality = parsed.overallQuality
    const overallQuality =
      quality === 'strong' || quality === 'mixed' || quality === 'needs_work' ? quality : 'mixed'
    const confidence =
      typeof parsed.confidence === 'number' && Number.isFinite(parsed.confidence)
        ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
        : 70
    const checkAnswerIndex =
      typeof parsed.checkAnswerIndex === 'number' &&
      parsed.checkAnswerIndex >= 0 &&
      parsed.checkAnswerIndex < checkOptions.length
        ? parsed.checkAnswerIndex
        : 0

    return {
      title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title : `${SUBJECT_LABEL[target]} answer sheet`,
      subject:
        typeof parsed.subject === 'string' && parsed.subject.trim()
          ? parsed.subject
          : SUBJECT_LABEL[target],
      overallQuality,
      confidence,
      summary: parsed.summary.trim(),
      workingWell,
      needsImprovement,
      flaggedWeakness:
        typeof parsed.flaggedWeakness === 'string' && parsed.flaggedWeakness.trim()
          ? parsed.flaggedWeakness.trim()
          : needsImprovement[0],
      nextSteps:
        nextSteps.length > 0
          ? nextSteps
          : ['Review the flagged weakness', 'Practice 3 similar questions', 'Re-scan after practice'],
      checkQuestion:
        typeof parsed.checkQuestion === 'string' && parsed.checkQuestion.trim()
          ? parsed.checkQuestion.trim()
          : remediationTemplates[target].validationQuestion,
      checkOptions: checkOptions.length >= 2 ? checkOptions : [...remediationTemplates[target].options],
      checkAnswerIndex,
      source: 'live',
    }
  } catch {
    return null
  }
}

/** Compress image for vision API (edge body limits). */
export async function fileToVisionPayload(file: File): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  const previewUrl = URL.createObjectURL(file)
  const bitmap = await createImageBitmap(file)
  const maxSide = 1400
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not prepare image')
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const mimeType = 'image/jpeg'
  const dataUrl = canvas.toDataURL(mimeType, 0.72)
  const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '')
  return { base64, mimeType, previewUrl }
}

export async function evaluatePaperCoach(
  target: ScanTarget,
  imageBase64: string,
  mimeType: string,
): Promise<PaperCoachInsight> {
  const prompt = [
    `Subject focus: ${SUBJECT_FOCUS[target]}.`,
    'Evaluate this student answer paper photo in coach mode.',
    'Identify what is working, what needs improvement, one primary flagged weakness, and a short remediation plan.',
    'Also create one mini check question tied to the flagged weakness.',
  ].join(' ')

  const result = await askOrbitAiVision(prompt, COACH_SYSTEM, imageBase64, mimeType, true)
  if (result.source === 'offline' || !result.text) {
    return { ...fallbackInsight(target), source: 'offline' }
  }
  const parsed = parseInsight(result.text, target)
  if (!parsed) {
    return { ...fallbackInsight(target), source: 'offline' }
  }
  return {
    ...parsed,
    model: result.model,
    source: 'live',
  }
}

export function getDemoInsight(target: ScanTarget): PaperCoachInsight {
  return fallbackInsight(target)
}
