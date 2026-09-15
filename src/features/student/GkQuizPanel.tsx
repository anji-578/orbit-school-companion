import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { translate } from '../../i18n'
import { useOrbitStore } from '../../store/orbitStore'
import {
  GK_LEVEL_ORDER,
  GK_PASS_RATIO,
  GK_ROUND_SIZE,
  getGkBankMeta,
  isGkLevelUnlocked,
  nextGkLevel,
  pickGkRound,
  scoreGkRound,
} from '../../lib/gkQuiz'
import type { GkDifficulty, GkQuestion } from '../../types'

type Phase = 'lobby' | 'playing' | 'results'

const LEVEL_META: Record<
  GkDifficulty,
  { labelKey: string; hintKey: string; accent: string; glow: string }
> = {
  easy: {
    labelKey: 'gkLevelEasy',
    hintKey: 'gkLevelEasyHint',
    accent: '#34D399',
    glow: 'rgba(52, 211, 153, 0.35)',
  },
  medium: {
    labelKey: 'gkLevelMedium',
    hintKey: 'gkLevelMediumHint',
    accent: '#FBBF24',
    glow: 'rgba(251, 191, 36, 0.35)',
  },
  hard: {
    labelKey: 'gkLevelHard',
    hintKey: 'gkLevelHardHint',
    accent: '#F472B6',
    glow: 'rgba(244, 114, 182, 0.35)',
  },
}

export function GkQuizPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const t = (key: string) => translate(lang, key)
  const gkProgress = useOrbitStore((s) => s.gkProgress)
  const recordGkRound = useOrbitStore((s) => s.recordGkRound)

  const meta = useMemo(() => getGkBankMeta(), [])
  const [phase, setPhase] = useState<Phase>('lobby')
  const [level, setLevel] = useState<GkDifficulty>('easy')
  const [round, setRound] = useState<GkQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [qIdx, setQIdx] = useState(0)
  const [popKey, setPopKey] = useState(0)
  const [result, setResult] = useState<ReturnType<typeof scoreGkRound> | null>(null)

  useEffect(() => {
    if (phase !== 'playing') return
    setPopKey((k) => k + 1)
  }, [qIdx, phase])

  const startRound = (diff: GkDifficulty) => {
    if (!isGkLevelUnlocked(diff, gkProgress)) {
      useOrbitStore.getState().triggerToast(t('gkLevelLockedToast'))
      return
    }
    const questions = pickGkRound(diff)
    setLevel(diff)
    setRound(questions)
    setAnswers({})
    setQIdx(0)
    setResult(null)
    setPhase('playing')
  }

  const selectAnswer = (optIdx: number) => {
    if (phase !== 'playing') return
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
    setPopKey((k) => k + 1)
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = round.length > 0 && answeredCount >= round.length
  const current = round[qIdx]

  const submitRound = () => {
    if (!allAnswered) {
      useOrbitStore.getState().triggerToast(t('gkAnswerAllFirst'))
      return
    }
    const scored = scoreGkRound(round, answers)
    setResult(scored)
    recordGkRound(level, scored.correct, scored.total, scored.passed)
    setPhase('results')
  }

  const goNextLevel = () => {
    const next = nextGkLevel(level)
    if (!next) {
      setPhase('lobby')
      return
    }
    startRound(next)
  }

  const passNeeded = Math.ceil(GK_ROUND_SIZE * GK_PASS_RATIO)

  return (
    <Panel
      title={t('gkQuizTitle')}
      subtitle={t('gkQuizSubtitle')
        .replace('{count}', String(meta.total))
        .replace('{size}', String(GK_ROUND_SIZE))}
      action={
        phase !== 'lobby' ? (
          <button
            type="button"
            onClick={() => setPhase('lobby')}
            className="btn-ghost px-3 py-2 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t('gkBackLobby')}
          </button>
        ) : null
      }
    >
      {phase === 'lobby' ? (
        <div className="space-y-5">
          <Card className="p-4 sm:p-5 flex flex-wrap items-center gap-4 justify-between">
            <div className="space-y-1">
              <Eyebrow>{t('gkProgressLabel')}</Eyebrow>
              <p className="text-sm font-bold text-white">
                {t('gkRoundsDone').replace('{n}', String(gkProgress.roundsCompleted))}
              </p>
              <p className="text-xs text-slate-400">
                {t('gkPassRule').replace('{n}', String(passNeeded)).replace('{total}', String(GK_ROUND_SIZE))}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[var(--accent2)]">
              <Sparkles className="h-5 w-5" aria-hidden />
              <span className="text-xs font-black uppercase tracking-wider">{t('gkInteractive')}</span>
            </div>
          </Card>

          <div className="grid sm:grid-cols-3 gap-3">
            {GK_LEVEL_ORDER.map((diff, roundNum) => {
              const unlocked = isGkLevelUnlocked(diff, gkProgress)
              const stats = gkProgress[diff]
              const metaLevel = LEVEL_META[diff]
              return (
                <button
                  key={diff}
                  type="button"
                  onClick={() => startRound(diff)}
                  disabled={!unlocked}
                  className={`gk-level-card relative text-left p-5 rounded-2xl border transition overflow-hidden ${
                    unlocked
                      ? 'border-white/15 bg-white/[0.04] hover:border-white/30 hover:-translate-y-0.5'
                      : 'border-white/5 bg-white/[0.02] opacity-60 cursor-not-allowed'
                  }`}
                  style={
                    unlocked
                      ? { boxShadow: `0 0 0 1px ${metaLevel.glow}, 0 12px 40px -20px ${metaLevel.glow}` }
                      : undefined
                  }
                >
                  <div
                    className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-40 pointer-events-none"
                    style={{ background: metaLevel.accent }}
                    aria-hidden
                  />
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: metaLevel.accent }}
                      >
                        {t('gkRoundN').replace('{n}', String(roundNum + 1))}
                      </span>
                      {unlocked ? (
                        <Zap className="h-4 w-4" style={{ color: metaLevel.accent }} aria-hidden />
                      ) : (
                        <Lock className="h-4 w-4 text-slate-500" aria-hidden />
                      )}
                    </div>
                    <p className="text-lg font-extrabold text-white font-display">{t(metaLevel.labelKey)}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{t(metaLevel.hintKey)}</p>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>
                        {stats.attempts > 0
                          ? t('gkBestScore')
                              .replace('{score}', String(stats.bestScore))
                              .replace('{total}', String(stats.bestTotal))
                          : t('gkNotAttempted')}
                      </span>
                      {stats.passed ? (
                        <span className="text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" aria-hidden />
                          {t('gkPassed')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">{t('gkLobbyFootnote')}</p>
        </div>
      ) : null}

      {phase === 'playing' && current ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: LEVEL_META[level].accent }}
              >
                {t(LEVEL_META[level].labelKey)} ·{' '}
                {t('gkQuestionOf')
                  .replace('{n}', String(qIdx + 1))
                  .replace('{total}', String(round.length))}
              </p>
              <p className="text-xs text-slate-400 mt-1">{current.category}</p>
            </div>
            <div className="text-xs font-bold text-slate-300">
              {answeredCount}/{round.length} {t('gkAnswered')}
            </div>
          </div>

          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full gk-progress-fill transition-all duration-500 ease-out"
              style={{
                width: `${((qIdx + 1) / round.length) * 100}%`,
                background: `linear-gradient(90deg, ${LEVEL_META[level].accent}, var(--accent2))`,
              }}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {round.map((_, i) => {
              const answered = answers[i] !== undefined
              const active = i === qIdx
              return (
                <button
                  key={round[i].id}
                  type="button"
                  onClick={() => setQIdx(i)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    active ? 'scale-150 ring-2 ring-white/40' : ''
                  } ${answered ? 'bg-[var(--accent2)]' : 'bg-white/15'}`}
                  aria-label={`Question ${i + 1}`}
                />
              )
            })}
          </div>

          <Card
            key={popKey}
            className="p-5 sm:p-6 space-y-5 gk-question-enter"
            style={{ borderColor: `${LEVEL_META[level].accent}33` }}
          >
            <p className="text-base sm:text-lg font-bold text-white leading-snug font-display">
              {current.question}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {current.options.map((opt, optIdx) => {
                const selected = answers[qIdx] === optIdx
                return (
                  <button
                    key={`${current.id}_${optIdx}`}
                    type="button"
                    onClick={() => selectAnswer(optIdx)}
                    className={`gk-option group relative text-left px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-300 ${
                      selected
                        ? 'gk-option-selected text-white scale-[1.02]'
                        : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white'
                    }`}
                    style={
                      selected
                        ? {
                            borderColor: LEVEL_META[level].accent,
                            background: `${LEVEL_META[level].accent}22`,
                            boxShadow: `0 0 24px -8px ${LEVEL_META[level].glow}`,
                          }
                        : undefined
                    }
                  >
                    <span className="inline-flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black border transition ${
                          selected
                            ? 'border-transparent text-slate-950'
                            : 'border-white/15 text-slate-400 group-hover:border-white/30'
                        }`}
                        style={selected ? { background: LEVEL_META[level].accent } : undefined}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </span>
                    {selected ? (
                      <span className="gk-option-burst absolute inset-0 rounded-xl pointer-events-none" aria-hidden />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={qIdx === 0}
              onClick={() => setQIdx((i) => Math.max(0, i - 1))}
              className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {t('gkPrev')}
            </button>

            {qIdx < round.length - 1 ? (
              <button
                type="button"
                onClick={() => setQIdx((i) => Math.min(round.length - 1, i + 1))}
                className="btn-accent px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                {t('gkNext')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitRound}
                disabled={!allAnswered}
                className="btn-accent px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {t('submitQuizText')}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {phase === 'results' && result ? (
        <div className="space-y-5 gk-results-enter">
          <Card className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              {result.passed ? (
                <Trophy className="h-7 w-7 text-amber-300" aria-hidden />
              ) : (
                <Sparkles className="h-7 w-7 text-[var(--accent2)]" aria-hidden />
              )}
            </div>
            <div>
              <p className="text-2xl font-black text-white font-display">
                {result.correct}/{result.total}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {result.percent}% · {t(LEVEL_META[level].labelKey)}
              </p>
            </div>
            <p className="text-sm font-semibold text-white">
              {result.passed ? t('gkRoundPassed') : t('gkRoundRetry')}
            </p>
          </Card>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {round.map((q, i) => {
              const chosen = answers[i]
              const correct = chosen === q.answerIndex
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    correct
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" aria-hidden />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" aria-hidden />
                    )}
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-bold text-white">
                        {i + 1}. {q.question}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {t('gkYourAnswer')}: {q.options[chosen] ?? '—'}
                      </p>
                      {!correct ? (
                        <p className="text-[11px] text-emerald-300">
                          {t('gkCorrectAnswer')}: {q.options[q.answerIndex]}
                        </p>
                      ) : null}
                      {q.explanation ? (
                        <p className="text-[11px] text-slate-500">{q.explanation}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => startRound(level)}
              className="btn-ghost px-4 py-2.5 rounded-xl text-xs font-bold text-white"
            >
              {t('tryAnother')}
            </button>
            {result.passed && nextGkLevel(level) ? (
              <button
                type="button"
                onClick={goNextLevel}
                className="btn-accent px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                {t('gkEnterRound2').replace(
                  '{level}',
                  t(LEVEL_META[nextGkLevel(level)!].labelKey),
                )}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPhase('lobby')}
                className="btn-accent px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                {t('gkBackLobby')}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </Panel>
  )
}
