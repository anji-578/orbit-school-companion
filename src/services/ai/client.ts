/**
 * Client AI adapter — talks only to /api/gemini (never a model vendor key).
 * Re-exports the proxy-only helpers from lib/gemini during the migration.
 */
export {
  askOrbitAi,
  askOrbitTutor,
  askOrbitAiVision,
  generateOrbitQuiz,
  isAiConfigured,
  type AiTextResult,
  type AiQuizResult,
} from '../../lib/gemini'
