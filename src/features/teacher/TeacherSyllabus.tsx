import { useMemo, useRef, useState } from 'react'
import { Check, Eye, FileText, Trash2, Upload } from 'lucide-react'
import { chapterProgress, curriculumProgress, useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Card, Eyebrow, Panel, ProgressBar, StatTile } from '../../components/ui/primitives'
import { EmptyState } from '../../components/ui/EmptyState'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { NotePreview } from '../../components/ui/NotePreview'

export function TeacherSyllabus() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const toggleSyllabusSubtopic = useOrbitStore((s) => s.toggleSyllabusSubtopic)
  const uploadSyllabusNote = useOrbitStore((s) => s.uploadSyllabusNote)
  const clearSyllabusNote = useOrbitStore((s) => s.clearSyllabusNote)

  const [filter, setFilter] = useState<string>('all')
  const [preview, setPreview] = useState<{ name?: string; dataUrl?: string; mime?: string } | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const t = (key: string) => translate(lang, key)
  const subjects = useMemo(
    () => ['all', ...Array.from(new Set(curriculum.map((c) => c.subject)))],
    [curriculum],
  )
  const visible = filter === 'all' ? curriculum : curriculum.filter((c) => c.subject === filter)
  const overall = curriculumProgress(curriculum)
  const doneCount = curriculum.flatMap((c) => c.subtopics).filter((s) => s.done).length
  const totalCount = curriculum.flatMap((c) => c.subtopics).length
  const notesCount = curriculum.flatMap((c) => c.subtopics).filter((s) => s.noteDataUrl).length

  if (!classLinked) {
    return (
      <Panel title={t('teacherSyllabusTitle')} subtitle={t('syllabusTeacherDesc')}>
        <InviteRedeemCard />
      </Panel>
    )
  }

  if (!curriculum.length) {
    return (
      <Panel title={t('teacherSyllabusTitle')} subtitle={t('syllabusTeacherDesc')}>
        <EmptyState title={t('syllabusEmptyTitle')} description={t('syllabusEmptyDesc')} />
      </Panel>
    )
  }

  return (
    <div className="space-y-5">
      <Panel title={t('teacherSyllabusTitle')} subtitle={t('syllabusTeacherDesc')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <StatTile
            label={t('overallProgress')}
            value={`${overall}%`}
            hint={`${doneCount}/${totalCount} ${t('subtopicsDone')}`}
          />
          <StatTile label={t('chapters')} value={String(curriculum.length)} />
          <StatTile label={t('notesUploaded')} value={String(notesCount)} />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto orbit-scroll pb-1 -mx-1 px-1">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setFilter(subject)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border transition ${
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
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white">{chapter.title}</h3>
                    <Eyebrow>
                      {chapter.subject} · {t('planned')} {chapter.plannedDate}
                    </Eyebrow>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-white leading-none">{progress}%</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {chapter.subtopics.filter((s) => s.done).length}/{chapter.subtopics.length} {t('done')}
                    </p>
                  </div>
                </div>
                <ProgressBar value={progress} />

                <ul className="space-y-2.5">
                  {chapter.subtopics.map((sub) => {
                    const inputKey = `${chapter.id}:${sub.id}`
                    return (
                      <li
                        key={sub.id}
                        className={`rounded-xl border px-3 py-2.5 transition ${
                          sub.done ? 'bg-emerald-500/8 border-emerald-500/25' : 'bg-white/[0.03] border-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            aria-pressed={sub.done}
                            aria-label={sub.done ? `Mark incomplete: ${sub.title}` : `Mark complete: ${sub.title}`}
                            onClick={() => toggleSyllabusSubtopic(chapter.id, sub.id)}
                            className={`mt-0.5 h-7 w-7 sm:h-6 sm:w-6 rounded-md border flex items-center justify-center shrink-0 transition ${
                              sub.done
                                ? 'bg-emerald-500 border-emerald-400 text-[#04120a]'
                                : 'border-white/20 text-transparent hover:border-[var(--accent)]'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="space-y-1">
                              <p
                                className={`text-xs sm:text-sm font-semibold ${
                                  sub.done ? 'text-slate-400 line-through' : 'text-white'
                                }`}
                              >
                                {sub.title}
                              </p>
                              <span
                                className={`inline-block text-[9px] font-bold uppercase tracking-wide ${
                                  sub.completedAt ? 'text-emerald-300/90' : 'text-amber-300/80'
                                }`}
                              >
                                {sub.completedAt ? `${t('finished')} ${sub.completedAt}` : t('pendingTopic')}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                              <input
                                ref={(el) => {
                                  fileRefs.current[inputKey] = el
                                }}
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) void uploadSyllabusNote(chapter.id, sub.id, file)
                                  e.target.value = ''
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => fileRefs.current[inputKey]?.click()}
                                className="btn-ghost inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-[10px] font-bold text-white"
                              >
                                <Upload className="h-3 w-3" aria-hidden />
                                {sub.noteDataUrl ? t('replaceNotes') : t('uploadNotes')}
                              </button>
                              {sub.noteDataUrl ? (
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreview({
                                        name: sub.noteName,
                                        dataUrl: sub.noteDataUrl,
                                        mime: sub.noteMime,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-[10px] font-bold text-[var(--accent2)] bg-white/5 border border-white/10"
                                  >
                                    <Eye className="h-3 w-3" aria-hidden />
                                    {t('previewNotes')}
                                  </button>
                                  <a
                                    href={sub.noteDataUrl}
                                    download={sub.noteName || 'notes'}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-[10px] font-bold text-slate-300 bg-white/5 border border-white/10"
                                  >
                                    <FileText className="h-3 w-3" aria-hidden />
                                    {t('download')}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => clearSyllabusNote(chapter.id, sub.id)}
                                    className="inline-flex items-center gap-1 px-2 py-2 sm:py-1.5 rounded-lg text-[10px] font-bold text-rose-300 hover:bg-rose-500/10"
                                    aria-label={`Remove notes for ${sub.title}`}
                                  >
                                    <Trash2 className="h-3 w-3" aria-hidden />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 self-center">{t('noNotesYet')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            )
          })}
        </div>
      </Panel>

      <NotePreview
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        name={preview?.name}
        dataUrl={preview?.dataUrl}
        mime={preview?.mime}
      />
    </div>
  )
}
