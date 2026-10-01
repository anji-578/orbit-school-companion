import { useMemo } from 'react'
import { BookOpen, ExternalLink, MessageCircle } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { chapterProgress } from '../../../store/orbitHelpers'
import { resolveRevisionNotes, resolveYoutubeUrl } from '../../../lib/syllabusLinks'
import { SaPrimaryButton, SaSection } from '../components/SaUi'
import { SaEmpty } from '../components/NestedChrome'
import { useStudentNav } from '../StudentNavContext'

/** Phase 4 — subject-scoped topics / resources. */
export function SubjectTopics() {
  const { params, openAskOrbit } = useStudentNav()
  const subject = params.subject || ''
  const resourcesOnly = params.section === 'resources'
  const curriculum = useOrbitStore((s) => s.curriculum)

  const chapters = useMemo(() => {
    if (!subject) return curriculum
    return curriculum.filter((c) => c.subject.toLowerCase() === subject.toLowerCase())
  }, [curriculum, subject])

  if (chapters.length === 0) {
    return (
      <SaEmpty
        title={subject ? `No ${subject} topics yet` : 'Syllabus not linked'}
        body="Topics appear when your school publishes the class syllabus."
        action={
          subject ? (
            <SaPrimaryButton onClick={() => openAskOrbit(`Teach me the basics of ${subject}.`)}>
              Ask Orbit anyway
            </SaPrimaryButton>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="space-y-4 pb-4">
      {chapters.map((chapter) => {
        const pct = chapterProgress(chapter)
        const resourceSubs = chapter.subtopics.filter(
          (s) => s.noteDataUrl || resolveYoutubeUrl(s) || resolveRevisionNotes(s),
        )
        if (resourcesOnly && resourceSubs.length === 0) return null

        return (
          <article
            key={chapter.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="h-9 w-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-[var(--fg)] leading-snug">{chapter.title}</p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  {chapter.subject} · {pct}% complete
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
            </div>

            {!resourcesOnly ? (
              <ul className="space-y-1.5">
                {chapter.subtopics.map((sub) => (
                  <li key={sub.id} className="text-xs text-[var(--fg)] flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${sub.done ? 'bg-emerald-500' : 'bg-[var(--muted)]'}`}
                    />
                    <span className={sub.done ? 'text-[var(--muted)] line-through' : ''}>{sub.title}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {(resourcesOnly ? resourceSubs : chapter.subtopics).map((sub) => {
                const yt = resolveYoutubeUrl(sub)
                const notes = resolveRevisionNotes(sub)
                if (!yt && !notes && !sub.noteDataUrl) return null
                return (
                  <div key={`res-${sub.id}`} className="flex flex-wrap gap-1.5 w-full">
                    {yt ? (
                      <a
                        href={yt}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)]"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden />
                        Video · {sub.title}
                      </a>
                    ) : null}
                    {notes || sub.noteDataUrl ? (
                      <span className="text-[11px] font-bold text-[var(--muted)]">Notes · {sub.title}</span>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                openAskOrbit(`Help me understand ${chapter.title} in ${chapter.subject}. Keep it simple.`)
              }
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)]"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Ask about this topic
            </button>
          </article>
        )
      })}

      {resourcesOnly &&
      chapters.every((c) => !c.subtopics.some((s) => s.noteDataUrl || resolveYoutubeUrl(s))) ? (
        <SaEmpty title="No resources yet" body="Teacher notes and videos will appear here when shared." />
      ) : null}

      <SaSection eyebrow="Help">
        <button
          type="button"
          onClick={() => openAskOrbit(subject ? `Help me with ${subject}.` : 'Help me study.')}
          className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-left text-sm font-bold text-[var(--fg)]"
        >
          Need help? Ask Orbit
        </button>
      </SaSection>
    </div>
  )
}
