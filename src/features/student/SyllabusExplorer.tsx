import { BrainCircuit, ClipboardList } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { subjectSyllabusDatabase } from '../../data/demo'
import { Panel, Card, Eyebrow, ProgressBar } from '../../components/ui/primitives'

const SUBJECT_KEYS = Object.keys(subjectSyllabusDatabase) as (keyof typeof subjectSyllabusDatabase)[]

export function SyllabusExplorer() {
  const lang = useOrbitStore((s) => s.lang)
  const setAiPrompt = useOrbitStore((s) => s.setAiPrompt)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  const t = (key: string) => translate(lang, key)

  const handleAskAi = (mistakeText: string, name: string) => {
    setAiPrompt(`Explain ${name}: ${mistakeText}`)
    setActiveTab('study-assistant')
  }

  const handlePracticeQuiz = (quizQuery: string) => {
    setAiPrompt(quizQuery)
    setActiveTab('study-assistant')
  }

  return (
    <Panel title={t('studentSyllabus')} subtitle="Explore every chapter and jump straight into AI-guided practice.">
      <div className="space-y-6">
        {SUBJECT_KEYS.map((subjectKey) => (
          <div key={subjectKey} className="space-y-3">
            <Eyebrow>{t(subjectKey)}</Eyebrow>
            <div className="grid sm:grid-cols-2 gap-4">
              {subjectSyllabusDatabase[subjectKey].map((topic) => (
                <Card key={topic.name} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">{topic.name}</h4>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${
                        topic.strength === 'High'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                      }`}
                    >
                      {topic.strength === 'High' ? t('excellent') : t('needsPolish')}
                    </span>
                  </div>
                  <ProgressBar value={topic.scoring} />
                  <div className="flex flex-wrap gap-1.5">
                    {topic.subtopics.map((sub) => (
                      <span key={sub} className="text-[9px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {sub}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{topic.mistakeText}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAskAi(topic.mistakeText, topic.name)}
                      className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
                    >
                      <BrainCircuit className="h-3.5 w-3.5" aria-hidden />
                      {t('askAi')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePracticeQuiz(topic.quizQuery)}
                      className="btn-accent flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold"
                    >
                      <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                      {t('generateQuiz')}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
