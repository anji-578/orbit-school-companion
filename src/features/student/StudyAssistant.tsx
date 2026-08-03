import { useRef, useState, useMemo } from 'react'
import { CheckCircle2, Info, Loader2, Mic, MicOff, RefreshCw, Send, Volume2, VolumeX, XCircle } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { askOrbitTutor, generateOrbitQuiz, isAiConfigured } from '../../lib/gemini'
import type { TutorAnswer } from '../../lib/aiGuardrails'
import { renderFormattedContent } from '../../lib/markdown'
import { startVoiceRecognition, speakText } from '../../lib/speech'
import type { VoiceRecognitionHandle, SpeechHandle } from '../../lib/speech'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { currentDayCode, deriveTodayTimeline } from '../../lib/timetableApi'

export function StudyAssistant() {
  const lang = useOrbitStore((s) => s.lang)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const aiPrompt = useOrbitStore((s) => s.aiPrompt)
  const aiResponse = useOrbitStore((s) => s.aiResponse)
  const aiLoading = useOrbitStore((s) => s.aiLoading)
  const aiSource = useOrbitStore((s) => s.aiSource)
  const [tutorMeta, setTutorMeta] = useState<TutorAnswer | null>(null)
  const quizMode = useOrbitStore((s) => s.quizMode)
  const activeQuiz = useOrbitStore((s) => s.activeQuiz)
  const selectedAnswers = useOrbitStore((s) => s.selectedAnswers)
  const quizScore = useOrbitStore((s) => s.quizScore)
  const isListening = useOrbitStore((s) => s.isListening)
  const isSpeaking = useOrbitStore((s) => s.isSpeaking)

  const setAiPrompt = useOrbitStore((s) => s.setAiPrompt)
  const setAiLoading = useOrbitStore((s) => s.setAiLoading)
  const setAiResult = useOrbitStore((s) => s.setAiResult)
  const setQuiz = useOrbitStore((s) => s.setQuiz)
  const setSelectedAnswer = useOrbitStore((s) => s.setSelectedAnswer)
  const submitQuiz = useOrbitStore((s) => s.submitQuiz)
  const setListening = useOrbitStore((s) => s.setListening)
  const setSpeaking = useOrbitStore((s) => s.setSpeaking)
  const clearAiPanel = useOrbitStore((s) => s.clearAiPanel)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const unlockBadge = useOrbitStore((s) => s.unlockBadge)
  const addXp = useOrbitStore((s) => s.addXp)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)

  const recognitionRef = useRef<VoiceRecognitionHandle | null>(null)
  const speechRef = useRef<SpeechHandle | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)

  const t = (key: string) => translate(lang, key)

  const studyNudge = useMemo(() => {
    const next = deriveTodayTimeline(timetableByDay[currentDayCode()]).find(
      (item) => item.status !== 'Completed',
    )
    return next ? t('studyNudgeRevision').replace('{subject}', next.name) : null
  }, [timetableByDay, lang])

  const handleAsk = async () => {
    if (!aiPrompt.trim() || aiLoading) return
    setAiLoading(true)
    setTutorMeta(null)
    const result = await askOrbitTutor(aiPrompt, curriculum)
    setTutorMeta(result.answer)
    setAiResult(result.text, result.source)
    if (result.source === 'offline' && result.error) {
      triggerToast(`AI offline: ${result.error.slice(0, 80)}`)
    }
    if (result.answer.refuse) {
      triggerToast(t('aiRefusedToast'))
    } else {
      unlockBadge('Curious Mind')
      addXp(10)
    }
  }

  const handleGenerateQuiz = async () => {
    if (quizLoading) return
    setQuizLoading(true)
    setAiLoading(true)
    const topic = aiPrompt.trim().length > 0 ? aiPrompt : 'Recap Quiz'
    const result = await generateOrbitQuiz(topic)
    setQuiz(result.quiz, result.source)
    if (result.source === 'offline' && result.error) {
      triggerToast(`Quiz offline: ${result.error.slice(0, 80)}`)
    }
    setQuizLoading(false)
  }

  const handleMicToggle = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    setListening(true)
    recognitionRef.current = startVoiceRecognition(
      (transcript) => {
        setAiPrompt(transcript)
        setListening(false)
      },
      (message) => {
        triggerToast(message)
        setListening(false)
      },
    )
    if (!recognitionRef.current) setListening(false)
  }

  const handleSpeakToggle = () => {
    if (isSpeaking) {
      speechRef.current?.cancel()
      setSpeaking(false)
      return
    }
    const handle = speakText(aiResponse, lang)
    speechRef.current = handle
    setSpeaking(handle.speaking)
    if (handle.speaking) {
      const words = aiResponse.split(/\s+/).filter(Boolean).length
      const estMs = Math.max(1500, words * 340)
      window.setTimeout(() => setSpeaking(false), estMs)
    }
  }

  return (
    <Panel
      title={t('studentStudyCopilot')}
      subtitle={t('copilotDesc')}
      action={
        (aiResponse || quizMode) && (
          <button
            type="button"
            onClick={() => {
              speechRef.current?.cancel()
              setSpeaking(false)
              setTutorMeta(null)
              clearAiPanel()
            }}
            className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {t('tryAnother')}
          </button>
        )
      }
    >
      <p className="text-[11px] text-amber-100/90 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
        {t('aiGuardrailBanner')}
      </p>

      {!isAiConfigured() ? (
        <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Gemini API key not configured — running in offline demo mode.
        </div>
      ) : null}

      {!aiResponse && !quizMode && studyNudge ? (
        <button
          type="button"
          onClick={() => setAiPrompt(studyNudge)}
          className="w-full text-left text-[11px] text-[var(--ai-hint)] bg-violet-500/10 border border-violet-500/25 rounded-xl px-3 py-2 hover:border-violet-400/40 transition"
        >
          {studyNudge}
        </button>
      ) : null}

      <div className="space-y-3">
        <label htmlFor="ai-prompt" className="sr-only">
          {t('struggleQuestion')}
        </label>
        <div className="relative">
          <textarea
            id="ai-prompt"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={t('struggleQuestion')}
            rows={3}
            className="field w-full rounded-xl px-4 py-3 text-sm resize-none pr-12"
          />
          <button
            type="button"
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={isListening}
            onClick={handleMicToggle}
            className={`absolute right-3 top-3 p-2 rounded-lg transition ${
              isListening ? 'bg-rose-500/20 text-rose-300 animate-pulse' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAsk}
            disabled={aiLoading || !aiPrompt.trim()}
            className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
          >
            {aiLoading && !quizLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {t('askAi')}
          </button>
          <button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={aiLoading}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50"
          >
            {quizLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {t('generateQuiz')}
          </button>
        </div>
      </div>

      {aiResponse ? (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Eyebrow>{aiSource === 'live' ? t('liveAiAnswer') : t('offlineAiBadge')}</Eyebrow>
            <div className="flex items-center gap-2 flex-wrap">
              {tutorMeta ? (
                <span
                  className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full border ${
                    tutorMeta.confidence === 'high'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : tutorMeta.confidence === 'medium'
                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/25'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                  }`}
                >
                  {t(`aiConfidence_${tutorMeta.confidence}`)}
                </span>
              ) : null}
              {tutorMeta?.groundedInSyllabus ? (
                <span className="text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25">
                  {t('aiGroundedSyllabus')}
                </span>
              ) : null}
              <span
                className={`text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full ${
                  aiSource === 'live'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                }`}
              >
                {aiSource === 'live' ? t('syncLive') : t('usingOfflineAnswer')}
              </span>
              <button
                type="button"
                aria-label={isSpeaking ? 'Stop reading aloud' : 'Read answer aloud'}
                aria-pressed={isSpeaking}
                onClick={handleSpeakToggle}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition"
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" aria-hidden /> : <Volume2 className="h-3.5 w-3.5" aria-hidden />}
              </button>
            </div>
          </div>
          <div className="prose-ai text-sm">{renderFormattedContent(aiResponse)}</div>
          <p className="text-[11px] text-slate-400 border-t border-white/10 pt-3">{t('aiVerifyWithTeacher')}</p>
        </Card>
      ) : null}

      {quizMode && activeQuiz ? (
        <Card className="p-5 space-y-4">
          <Eyebrow>{activeQuiz.topic}</Eyebrow>
          <div className="space-y-4">
            {activeQuiz.questions.map((question, qIdx) => {
              const selected = selectedAnswers[qIdx]
              return (
                <div key={question.id} className="space-y-2">
                  <p className="text-sm font-semibold text-white">
                    {qIdx + 1}. {question.question}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {question.options.map((opt, optIdx) => {
                      const isSelected = selected === optIdx
                      const showResult = quizScore !== null
                      const isCorrect = optIdx === question.answerIndex
                      let stateClass = 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                      if (showResult && isCorrect) {
                        stateClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      } else if (showResult && isSelected && !isCorrect) {
                        stateClass = 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                      } else if (!showResult && isSelected) {
                        stateClass = 'border-[var(--accent)] bg-[var(--accent)]/10 text-white'
                      }
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={showResult}
                          onClick={() => setSelectedAnswer(qIdx, optIdx)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between gap-2 ${stateClass}`}
                        >
                          {opt}
                          {showResult && isCorrect ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                          {showResult && isSelected && !isCorrect ? <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {quizScore === null ? (
            <button
              type="button"
              onClick={submitQuiz}
              disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
              className="btn-accent px-4 py-2.5 rounded-xl text-xs font-bold w-full sm:w-auto disabled:opacity-50"
            >
              {t('submitQuizText')}
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <p className="text-sm font-bold text-white">
                {t('quizCompleted')} · {quizScore}/{activeQuiz.questions.length}
              </p>
              <button
                type="button"
                onClick={handleGenerateQuiz}
                className="btn-ghost px-4 py-2 rounded-xl text-xs font-bold text-white"
              >
                {t('tryAnother')}
              </button>
            </div>
          )}
        </Card>
      ) : null}
    </Panel>
  )
}
