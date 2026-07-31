import { useMemo, useState } from 'react'
import { BrainCircuit, CheckCircle2, ClipboardList, FileText } from 'lucide-react'
import { chapterProgress, curriculumProgress, useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, ProgressBar, StatTile } from '../../components/ui/primitives'

export function SyllabusExplorer() {
  const lang = useOrbitStore((s) => s.lang)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const setAiPrompt = useOrbitStore((s) => s.setAiPrompt)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  const [filter, setFilter] = useState('all')
  const t = (key: string) => translate(lang, key)

  const subjects = useMemo(
    () => ['all', ...Array.from(new Set(curriculum.map((c) => c.subject)))],
    [curriculum],
  )
  const visible = filter === 'all' ? curriculum : curriculum.filter((c) => c.subject === filter)
  const overall = curriculumProgress(curriculum)
  const doneCount = curriculum.flatMap((c) => c.subtopics).filter((s) => s.done).length
  const totalCount = curriculum.flatMap((c) => c.subtopics).length
  const notesReady = curriculum.flatMap((c) => c.subtopics).filter((s) => s.noteDataUrl).length

  return (
    <div className="space-y-5">
      <Panel title={t('studentSyllabus')} subtitle={t('syllabusStudentDesc')}>
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <StatTile label={t('classProgress')} value={`${overall}%`} hint={t('teacherTracked')} />
          <StatTile label={t('subtopicsDone')} value={`${doneCount}/${totalCount}`} />
          <StatTile label={t('teacherNotes')} value={String(notesReady)} hint={t('readyToDownload')} />
        </div>

        <div className="mb-5 rounded-2xl border border-white/10 bg-gradient-to-r from-[var(--accent)]/15 to-transparent p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('overallProgress')}</p>
          <ProgressBar value={overall} />
          <p className="text-[11px] text-slate-400 mt-2">{t('syllabusProgressHint')}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setFilter(subject)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition ${
                filter === subject
                  ? 'bg-[var(--accent)]/20 border-[var(--accent)]/40 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {subject === 'all' ? t('allSubjects') : subject}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {visible.map((chapter) => {
            const progress = chapterProgress(chapter)
            return (
              <Card key={chapter.id} className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{chapter.title}</h3>
                    <Eyebrow>
                      {chapter.subject} · {progress}% {t('complete')}
                    </Eyebrow>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                      progress === 100
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                        : progress >= 50
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/25'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                    }`}
                  >
                    {progress === 100 ? t('chapterComplete') : t('inProgress')}
                  </span>
                </div>
                <ProgressBar value={progress} />

                <ul className="space-y-2">
                  {chapter.subtopics.map((sub) => (
                    <li
                      key={sub.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                        sub.done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <CheckCircle2
                          className={`h-4 w-4 mt-0.5 shrink-0 ${sub.done ? 'text-emerald-400' : 'text-slate-600'}`}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${sub.done ? 'text-slate-300 line-through' : 'text-white'}`}>
                            {sub.title}
                          </p>
                          {sub.completedAt ? (
                            <p className="text-[10px] text-emerald-300/80 mt-0.5">
                              {t('finished')} {sub.completedAt}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-500 mt-0.5">{t('awaitingTeacher')}</p>
                          )}
                        </div>
                      </div>
                      {sub.noteDataUrl ? (
                        <a
                          href={sub.noteDataUrl}
                          download={sub.noteName || 'teacher-notes'}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[var(--accent2)] bg-white/5 border border-white/10 shrink-0"
                        >
                          <FileText className="h-3 w-3" aria-hidden />
                          {t('teacherNotes')}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt(`Explain ${chapter.title} (${chapter.subject}) with simple examples for Class 11.`)
                      setActiveTab('study-assistant')
                    }}
                    className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
                  >
                    <BrainCircuit className="h-3.5 w-3.5" aria-hidden />
                    {t('askAi')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt(chapter.quizQuery)
                      setActiveTab('study-assistant')
                    }}
                    className="btn-accent flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold"
                  >
                    <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                    {t('generateQuiz')}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
