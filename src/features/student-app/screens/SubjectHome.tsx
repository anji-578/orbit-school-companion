import { useMemo } from 'react'
import { ArrowRight, BookOpen, ClipboardList, FileText, FolderOpen, LineChart } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { chapterProgress } from '../../../store/orbitHelpers'
import { SaCard, SaPrimaryButton, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

const SUBJECT_COLORS = ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2']

/** Subject home — natural place for academic depth. */
export function SubjectHome() {
  const { push, params } = useStudentNav()
  const subject = params.subject || 'Subject'
  const curriculum = useOrbitStore((s) => s.curriculum)
  const tasks = useOrbitStore((s) => s.tasks)
  const setAiPrompt = useOrbitStore((s) => s.setAiPrompt)

  const chapters = useMemo(
    () => curriculum.filter((c) => c.subject.toLowerCase() === subject.toLowerCase()),
    [curriculum, subject],
  )
  const subjectTasks = useMemo(
    () => tasks.filter((t) => t.subject.toLowerCase() === subject.toLowerCase()),
    [tasks, subject],
  )
  const pendingHw = subjectTasks.filter((t) => !t.completed)
  const currentChapter = chapters.find((c) => chapterProgress(c) < 100) ?? chapters[0]
  const progress = currentChapter ? chapterProgress(currentChapter) : 0
  const color = SUBJECT_COLORS[Math.abs(hash(subject)) % SUBJECT_COLORS.length]

  return (
    <div className="space-y-5 pb-4">
      <SaCard className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <span
            className="h-11 w-11 rounded-2xl flex items-center justify-center text-white text-sm font-black shrink-0"
            style={{ background: color }}
          >
            {subject.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Current topic</p>
            <p className="text-base font-extrabold text-[var(--fg)] mt-0.5 leading-snug">
              {currentChapter?.title ?? 'No topic yet'}
            </p>
            <p className="text-[11px] text-[var(--muted)] mt-1">{progress}% complete</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
        </div>
        <div className="flex flex-wrap gap-2">
          <SaPrimaryButton
            onClick={() => {
              if (pendingHw[0]) {
                push('homework', { subject }, 'Homework')
                return
              }
              push('syllabus', { subject }, 'Topics')
            }}
          >
            Continue learning
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </SaPrimaryButton>
          <button
            type="button"
            onClick={() => {
              setAiPrompt(
                currentChapter
                  ? `Help me understand ${currentChapter.title} in ${subject}. Keep it simple.`
                  : `Help me with ${subject}.`,
              )
              push('study-assistant', { subject }, 'Ask Orbit')
            }}
            className="rounded-xl px-3.5 py-2.5 text-xs font-bold border border-[var(--border)] text-[var(--fg)]"
          >
            Need help?
          </button>
        </div>
      </SaCard>

      <SaSection eyebrow="In this subject">
        <div className="space-y-2">
          <SubjectLink
            icon={BookOpen}
            title="Topics"
            meta={chapters.length ? `${chapters.length} units` : 'Syllabus not linked yet'}
            onClick={() => push('syllabus', { subject }, 'Topics')}
          />
          <SubjectLink
            icon={ClipboardList}
            title="Homework"
            meta={`${pendingHw.length} active`}
            onClick={() => push('homework', { subject }, 'Homework')}
          />
          <SubjectLink
            icon={FileText}
            title="Assessments"
            meta="Marks and feedback"
            onClick={() => push('assessments', { subject }, 'Assessments')}
          />
          <SubjectLink
            icon={FolderOpen}
            title="Resources"
            meta="Notes and videos"
            onClick={() => push('syllabus', { subject, section: 'resources' }, 'Resources')}
          />
          <SubjectLink
            icon={LineChart}
            title="Progress"
            meta="Learning health"
            onClick={() => push('academics', { subject }, 'Progress')}
          />
        </div>
      </SaSection>
    </div>
  )
}

function SubjectLink({
  icon: Icon,
  title,
  meta,
  onClick,
}: {
  icon: typeof BookOpen
  title: string
  meta: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-left"
    >
      <span className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-[var(--accent)]" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-[var(--fg)]">{title}</span>
        <span className="text-[11px] text-[var(--muted)]">{meta}</span>
      </span>
    </button>
  )
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}
