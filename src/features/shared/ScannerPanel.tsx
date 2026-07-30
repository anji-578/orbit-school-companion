import { useState } from 'react'
import {
  BadgeCheck,
  Calculator,
  CheckCircle2,
  FlaskConical,
  Loader2,
  RefreshCw,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { remediationTemplates } from '../../data/demo'
import { askOrbitAi } from '../../lib/gemini'
import { renderFormattedContent } from '../../lib/markdown'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import type { ScanTarget } from '../../types'

const STEP_ORDER: Record<string, number> = {
  select: 0,
  scanning: 0,
  evaluated: 0,
  analogy: 1,
  validated: 2,
}

export function ScannerPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const scanStep = useOrbitStore((s) => s.scanStep)
  const scanTarget = useOrbitStore((s) => s.scanTarget)
  const scanModel = useOrbitStore((s) => s.scanModel)
  const scanConfidence = useOrbitStore((s) => s.scanConfidence)
  const remediationMarkdown = useOrbitStore((s) => s.remediationMarkdown)
  const remediationLoading = useOrbitStore((s) => s.remediationLoading)
  const remediationSource = useOrbitStore((s) => s.remediationSource)
  const selectedValidationAnswer = useOrbitStore((s) => s.selectedValidationAnswer)
  const validationSubmitted = useOrbitStore((s) => s.validationSubmitted)

  const startScan = useOrbitStore((s) => s.startScan)
  const setRemediation = useOrbitStore((s) => s.setRemediation)
  const setRemediationLoading = useOrbitStore((s) => s.setRemediationLoading)
  const setValidationAnswer = useOrbitStore((s) => s.setValidationAnswer)
  const submitValidation = useOrbitStore((s) => s.submitValidation)
  const resetScanner = useOrbitStore((s) => s.resetScanner)

  const [wrongFlash, setWrongFlash] = useState(false)

  const t = (key: string) => translate(lang, key)
  const tpl = remediationTemplates[scanTarget]
  const stepIndex = STEP_ORDER[scanStep] ?? 0

  const handleGenerateAnalogy = async () => {
    setRemediationLoading(true)
    const prompt = `Explain the concept behind this student weakness using one short, friendly, real-world analogy: "${tpl.flaggedWeakness}". Context: ${tpl.analysisText} Format the answer in markdown with a heading, 2-3 bullet points, and one formula wrapped in $$ if relevant.`
    const system =
      'You are Orbit AI, a patient school tutor. Explain concepts to a school student with a vivid, simple analogy. Keep responses under 120 words.'
    const result = await askOrbitAi(prompt, system)
    const text = result.source === 'offline' ? tpl.analogyText : result.text
    setRemediation(text, result.source)
  }

  const handleSubmitValidation = () => {
    const wasCorrect = selectedValidationAnswer === tpl.correctIndex
    submitValidation()
    if (!wasCorrect) {
      setWrongFlash(true)
      window.setTimeout(() => setWrongFlash(false), 1500)
    }
  }

  return (
    <Panel
      title={t('scannerTitle')}
      subtitle={t('scannerDesc')}
      action={
        <button
          type="button"
          onClick={resetScanner}
          className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          {t('resetDemo')}
        </button>
      }
    >
      <div className="flex items-center gap-2" aria-hidden>
        {[t('step1Select'), t('step2Analogy'), t('step3Validate')].map((label, idx) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black border ${
                stepIndex >= idx
                  ? 'bg-[var(--accent)] text-black border-transparent'
                  : 'border-white/15 text-slate-500'
              }`}
            >
              {idx + 1}
            </div>
            <span className={`text-[10px] font-bold ${stepIndex >= idx ? 'text-white' : 'text-slate-500'}`}>
              {label}
            </span>
            {idx < 2 ? <div className={`flex-1 h-px ${stepIndex > idx ? 'bg-[var(--accent)]' : 'bg-white/10'}`} /> : null}
          </div>
        ))}
      </div>

      {scanStep === 'select' ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {(['chemistry', 'mathematics'] as ScanTarget[]).map((target) => {
            const Icon = target === 'chemistry' ? FlaskConical : Calculator
            const label = target === 'chemistry' ? t('chemLabSubject') : t('mathSubject')
            return (
              <Card key={target} onClick={() => startScan(target)} className="p-5 space-y-3">
                <div className="h-11 w-11 rounded-xl accent-soft flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{label}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{remediationTemplates[target].flaggedWeakness}</p>
                </div>
              </Card>
            )
          })}
        </div>
      ) : null}

      {scanStep === 'scanning' ? (
        <Card className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative h-20 w-16 rounded-lg border-2 border-white/15 overflow-hidden shimmer">
            <ScanLine className="h-6 w-6 text-[var(--accent2)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Scanning answer sheet…</p>
            <p className="text-[11px] text-slate-400 mt-1">{tpl.title}</p>
          </div>
          <Loader2 className="h-5 w-5 text-[var(--accent)] animate-spin" aria-hidden />
        </Card>
      ) : null}

      {scanStep === 'evaluated' || scanStep === 'analogy' || scanStep === 'validated' ? (
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Eyebrow>{tpl.title}</Eyebrow>
              <p className="text-sm font-bold text-white mt-1">{tpl.flaggedWeakness}</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full accent-soft text-[var(--accent2)]">
              {scanModel} · {scanConfidence}%
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{tpl.analysisText}</p>

          {scanStep === 'evaluated' ? (
            <button
              type="button"
              onClick={handleGenerateAnalogy}
              className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold w-full sm:w-auto justify-center"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Generate AI Analogy
            </button>
          ) : null}
        </Card>
      ) : null}

      {(scanStep === 'analogy' || scanStep === 'validated') ? (
        <Card className="p-5 space-y-4">
          {remediationLoading ? (
            <div className="flex items-center gap-3 py-6 justify-center">
              <Loader2 className="h-5 w-5 text-[var(--accent)] animate-spin" aria-hidden />
              <span className="text-xs text-slate-400 font-semibold">Composing analogy…</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <Eyebrow>Concept Analogy</Eyebrow>
                {remediationSource ? (
                  <span
                    className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                      remediationSource === 'live'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                    }`}
                  >
                    {remediationSource === 'live' ? t('liveAiAnswer') : t('offlineAiBadge')}
                  </span>
                ) : null}
              </div>
              <div className="prose-ai text-sm">{renderFormattedContent(remediationMarkdown)}</div>

              {scanStep === 'analogy' ? (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <Eyebrow>{t('interactiveEvaluator')}</Eyebrow>
                  <p className="text-sm font-semibold text-white">{tpl.validationQuestion}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {tpl.options.map((opt, idx) => {
                      const selected = selectedValidationAnswer === idx
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setValidationAnswer(idx)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition ${
                            selected
                              ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {wrongFlash ? (
                    <p className="text-[11px] font-semibold text-rose-400">Not quite — review the analogy above and try again.</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={selectedValidationAnswer === null || validationSubmitted}
                    onClick={handleSubmitValidation}
                    className="btn-accent px-4 py-2.5 rounded-xl text-xs font-bold w-full sm:w-auto"
                  >
                    Submit Answer
                  </button>
                </div>
              ) : null}
            </>
          )}
        </Card>
      ) : null}

      {scanStep === 'validated' ? (
        <Card className="p-6 flex flex-col items-center text-center gap-3 border-emerald-500/30">
          <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" aria-hidden />
          </div>
          <h3 className="text-lg font-black text-white">{t('conceptMastered')}</h3>
          <p className="text-xs text-slate-300 max-w-sm">{tpl.successToast}</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent2)]">
            <BadgeCheck className="h-4 w-4" aria-hidden /> Concept Master badge unlocked · +100 XP
          </span>
        </Card>
      ) : null}
    </Panel>
  )
}
