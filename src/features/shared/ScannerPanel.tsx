import { useRef, useState } from 'react'
import {
  BadgeCheck,
  Calculator,
  Camera,
  CheckCircle2,
  FlaskConical,
  Loader2,
  RefreshCw,
  ScanLine,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
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

const QUALITY_LABEL: Record<string, string> = {
  strong: 'Strong attempt',
  mixed: 'Mixed quality',
  needs_work: 'Needs work',
}

export function ScannerPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const scanStep = useOrbitStore((s) => s.scanStep)
  const scanModel = useOrbitStore((s) => s.scanModel)
  const scanConfidence = useOrbitStore((s) => s.scanConfidence)
  const scanInsight = useOrbitStore((s) => s.scanInsight)
  const scanPreviewUrl = useOrbitStore((s) => s.scanPreviewUrl)
  const scanError = useOrbitStore((s) => s.scanError)
  const remediationMarkdown = useOrbitStore((s) => s.remediationMarkdown)
  const remediationLoading = useOrbitStore((s) => s.remediationLoading)
  const remediationSource = useOrbitStore((s) => s.remediationSource)
  const selectedValidationAnswer = useOrbitStore((s) => s.selectedValidationAnswer)
  const validationSubmitted = useOrbitStore((s) => s.validationSubmitted)

  const startScan = useOrbitStore((s) => s.startScan)
  const evaluatePaperScan = useOrbitStore((s) => s.evaluatePaperScan)
  const setRemediation = useOrbitStore((s) => s.setRemediation)
  const setRemediationLoading = useOrbitStore((s) => s.setRemediationLoading)
  const setValidationAnswer = useOrbitStore((s) => s.setValidationAnswer)
  const submitValidation = useOrbitStore((s) => s.submitValidation)
  const resetScanner = useOrbitStore((s) => s.resetScanner)

  const [pickedTarget, setPickedTarget] = useState<ScanTarget>('chemistry')
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [wrongFlash, setWrongFlash] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const t = (key: string) => translate(lang, key)
  const insight = scanInsight
  const stepIndex = STEP_ORDER[scanStep] ?? 0
  const preview = scanPreviewUrl || localPreview

  const onPickFile = (file: File | null) => {
    if (localPreview) URL.revokeObjectURL(localPreview)
    if (!file) {
      setPendingFile(null)
      setLocalPreview(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      useOrbitStore.getState().triggerToast('Please upload a photo of the answer sheet.')
      return
    }
    setPendingFile(file)
    setLocalPreview(URL.createObjectURL(file))
  }

  const handleEvaluate = async () => {
    if (!pendingFile) {
      useOrbitStore.getState().triggerToast('Add a paper photo first, or try demo scan.')
      return
    }
    await evaluatePaperScan(pickedTarget, pendingFile)
  }

  const handleGenerateAnalogy = async () => {
    if (!insight) return
    setRemediationLoading(true)
    const prompt = `Explain the concept behind this student weakness using one short, friendly, real-world analogy: "${insight.flaggedWeakness}". Context: ${insight.summary}. Also touch on: ${insight.needsImprovement.join('; ')}. Format the answer in markdown with a heading, 2-3 bullet points, and one formula wrapped in $$ if relevant.`
    const system =
      'You are Orbit AI, a patient school tutor. Explain concepts to a school student with a vivid, simple analogy. Keep responses under 120 words.'
    const result = await askOrbitAi(prompt, system)
    setRemediation(result.text, result.source)
  }

  const handleSubmitValidation = () => {
    if (!insight) return
    const wasCorrect = selectedValidationAnswer === insight.checkAnswerIndex
    submitValidation()
    if (!wasCorrect) {
      setWrongFlash(true)
      window.setTimeout(() => setWrongFlash(false), 1500)
    }
  }

  return (
    <Panel
      title={t('scannerTitle')}
      subtitle="Coach mode: upload a real answer-sheet photo. AI reads it and explains what’s working vs what to improve."
      action={
        <button
          type="button"
          onClick={() => {
            if (localPreview) URL.revokeObjectURL(localPreview)
            setLocalPreview(null)
            setPendingFile(null)
            resetScanner()
          }}
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
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {(['chemistry', 'mathematics'] as ScanTarget[]).map((target) => {
              const Icon = target === 'chemistry' ? FlaskConical : Calculator
              const label = target === 'chemistry' ? t('chemLabSubject') : t('mathSubject')
              const active = pickedTarget === target
              return (
                <button
                  key={target}
                  type="button"
                  onClick={() => setPickedTarget(target)}
                  className={`p-4 rounded-2xl text-left border transition ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="h-10 w-10 rounded-xl accent-soft flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
                  </div>
                  <h3 className="text-sm font-bold text-white">{label}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Coach evaluate without an answer key</p>
                </button>
              )
            })}
          </div>

          <Card className="p-4 space-y-3">
            <Eyebrow>Paper photo</Eyebrow>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <img
                src={preview}
                alt="Answer sheet preview"
                className="w-full max-h-56 object-contain rounded-xl border border-white/10 bg-black/30"
              />
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full min-h-36 rounded-xl border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-white/35 hover:text-white transition"
              >
                <Camera className="h-6 w-6" aria-hidden />
                <span className="text-xs font-bold">Take photo or upload answer sheet</span>
              </button>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                {preview ? 'Change photo' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={handleEvaluate}
                disabled={!pendingFile}
                className="btn-accent flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
              >
                <ScanLine className="h-4 w-4" aria-hidden />
                Evaluate paper
              </button>
              <button
                type="button"
                onClick={() => startScan(pickedTarget)}
                className="btn-ghost px-3 py-2 rounded-lg text-[11px] font-bold text-slate-400"
              >
                Try demo (no photo)
              </button>
            </div>
          </Card>
        </div>
      ) : null}

      {scanStep === 'scanning' ? (
        <Card className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          {preview ? (
            <img
              src={preview}
              alt="Scanning"
              className="w-full max-h-40 object-contain rounded-lg border border-white/10 opacity-80"
            />
          ) : (
            <div className="relative h-20 w-16 rounded-lg border-2 border-white/15 overflow-hidden shimmer">
              <ScanLine className="h-6 w-6 text-[var(--accent2)] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-white">Reading answer sheet…</p>
            <p className="text-[11px] text-slate-400 mt-1">Coach mode · quality insights (not official marks)</p>
          </div>
          <Loader2 className="h-5 w-5 text-[var(--accent)] animate-spin" aria-hidden />
        </Card>
      ) : null}

      {(scanStep === 'evaluated' || scanStep === 'analogy' || scanStep === 'validated') && insight ? (
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Eyebrow>{insight.title}</Eyebrow>
              <p className="text-sm font-bold text-white mt-1">{insight.flaggedWeakness}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full accent-soft text-[var(--accent2)]">
                {QUALITY_LABEL[insight.overallQuality] ?? insight.overallQuality}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                {scanModel} · {scanConfidence}%
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                  insight.source === 'live'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                }`}
              >
                {insight.source === 'live' ? 'Live vision' : 'Offline'}
              </span>
            </div>
          </div>

          {preview ? (
            <img
              src={preview}
              alt="Evaluated sheet"
              className="w-full max-h-36 object-contain rounded-lg border border-white/10 bg-black/20"
            />
          ) : null}

          {scanError ? <p className="text-[11px] text-amber-300 font-semibold">{scanError}</p> : null}

          <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
              <Eyebrow>Working well</Eyebrow>
              <ul className="space-y-1.5">
                {insight.workingWell.map((item) => (
                  <li key={item} className="text-[11px] text-emerald-100/90 leading-snug">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 space-y-2">
              <Eyebrow>Can improve</Eyebrow>
              <ul className="space-y-1.5">
                {insight.needsImprovement.map((item) => (
                  <li key={item} className="text-[11px] text-rose-100/90 leading-snug">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
            <Eyebrow>Next steps (lifecycle plan seed)</Eyebrow>
            <ol className="space-y-1.5 list-decimal list-inside">
              {insight.nextSteps.map((item) => (
                <li key={item} className="text-[11px] text-slate-300 leading-snug">
                  {item}
                </li>
              ))}
            </ol>
          </div>

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

      {(scanStep === 'analogy' || scanStep === 'validated') && insight ? (
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
                  <p className="text-sm font-semibold text-white">{insight.checkQuestion}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {insight.checkOptions.map((opt, idx) => {
                      const selected = selectedValidationAnswer === idx
                      return (
                        <button
                          key={`${opt}-${idx}`}
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
                    <p className="text-[11px] font-semibold text-rose-400">
                      Not quite — review the analogy above and try again.
                    </p>
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

      {scanStep === 'validated' && insight ? (
        <Card className="p-6 flex flex-col items-center text-center gap-3 border-emerald-500/30">
          <div className="h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" aria-hidden />
          </div>
          <h3 className="text-lg font-black text-white">{t('conceptMastered')}</h3>
          <p className="text-xs text-slate-300 max-w-sm">
            Practiced: {insight.flaggedWeakness}. Next lifecycle step will use these coach notes.
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent2)]">
            <BadgeCheck className="h-4 w-4" aria-hidden /> Concept Master badge unlocked · +100 XP
          </span>
        </Card>
      ) : null}
    </Panel>
  )
}
