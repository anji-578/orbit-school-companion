import { useMemo } from 'react'
import {
  BookMarked,
  BrainCircuit,
  CalendarDays,
  CheckSquare,
  Clipboard,
  FileText,
  Sparkles,
  Calendar,
} from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { currentDayCode, deriveTodayTimeline } from '../../../lib/timetableApi'
import { SaCard, SaPrimaryButton, SaRow, SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import type { HomeworkTask } from '../../../types'

function taskMinutes(task: HomeworkTask): number {
  if (task.estimatedMinutes != null) return task.estimatedMinutes
  if (task.difficulty === 'Hard') return 45
  if (task.difficulty === 'Easy') return 15
  return 25
}

const SUBJECT_COLORS = ['#2563eb', '#059669', '#d97706', '#db2777', '#7c3aed', '#0891b2']

export function LearnHub() {
  const { push } = useStudentNav()
  const tasks = useOrbitStore((s) => s.tasks)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const curriculum = useOrbitStore((s) => s.curriculum)

  const pending = tasks.filter((t) => !t.completed)
  const continueTask = pending[0] ?? tasks[0]

  const todayClasses = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )

  const subjects = useMemo(() => {
    const fromSyllabus = curriculum.map((s) => s.subject).filter(Boolean)
    const fromGrades = studentGrades[0] ? ['Mathematics', 'Science', 'Chemistry'] : []
    const fromTasks = tasks.map((t) => t.subject)
    return [...new Set([...fromSyllabus, ...fromGrades, ...fromTasks])].slice(0, 8)
  }, [curriculum, studentGrades, tasks])

  const continuePct = continueTask
    ? continueTask.completed
      ? 100
      : continueTask.started
        ? 65
        : 20
    : 0

  return (
    <div className="space-y-5 pb-4">
      <div className="px-0.5">
        <h1 className="font-display text-xl font-extrabold text-[var(--fg)]">Learn</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Continue where you left off</p>
      </div>

      {/* Continue */}
      <SaSection eyebrow="Continue">
        <SaCard className="p-4 space-y-3">
          {continueTask ? (
            <>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  {continueTask.subject}
                </p>
                <p className="text-base font-extrabold text-[var(--fg)] mt-1 leading-snug">
                  {continueTask.task}
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  {continuePct}% · ~{taskMinutes(continueTask)} min · Due {continueTask.due}
                </p>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${continuePct}%`,
                    background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                  }}
                />
              </div>
              <SaPrimaryButton onClick={() => push('homework')}>Continue</SaPrimaryButton>
            </>
          ) : (
            <p className="text-sm text-[var(--muted)]">No open homework — explore a subject below.</p>
          )}
        </SaCard>
      </SaSection>

      {/* Today counts */}
      <SaSection eyebrow="Today">
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile label="Homework" value={pending.length} onClick={() => push('homework')} />
          <StatTile label="Classes" value={todayClasses.length} onClick={() => push('schedule')} />
          <StatTile
            label="Assessment"
            value={studentGrades.length ? 1 : 0}
            onClick={() => push('academics')}
          />
        </div>
      </SaSection>

      {/* Subjects */}
      <SaSection eyebrow="Subjects">
        <div className="grid grid-cols-2 gap-2.5">
          {subjects.length === 0 ? (
            <SaCard className="p-4 col-span-2">
              <p className="text-xs text-[var(--muted)]">Subjects appear when your school links a syllabus.</p>
            </SaCard>
          ) : (
            subjects.map((subject, i) => (
              <SaCard
                key={subject}
                className="p-3.5 flex items-center gap-3"
                onClick={() => push('syllabus')}
              >
                <span
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                  style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
                >
                  {subject.slice(0, 1)}
                </span>
                <span className="text-xs font-bold text-[var(--fg)] truncate">{subject}</span>
              </SaCard>
            ))
          )}
        </div>
      </SaSection>

      {/* Destinations inside Learn */}
      <SaSection eyebrow="Study tools">
        <div className="space-y-2">
          <SaRow
            icon={CheckSquare}
            title="Homework"
            subtitle={`${pending.length} open`}
            onClick={() => push('homework')}
          />
          <SaRow
            icon={Calendar}
            title="Classes"
            subtitle="Timetable for this week"
            onClick={() => push('schedule')}
          />
          <SaRow
            icon={FileText}
            title="Assessments & reports"
            subtitle="Marks and feedback"
            onClick={() => push('academics')}
          />
          <SaRow
            icon={BookMarked}
            title="Subjects & syllabus"
            onClick={() => push('syllabus')}
          />
          <SaRow
            icon={BrainCircuit}
            title="Study coach"
            subtitle="Ask Orbit when you're stuck"
            accent="#7c3aed"
            onClick={() => push('study-assistant')}
          />
          <SaRow
            icon={Clipboard}
            title="Paper scan"
            subtitle="Snap a page for feedback"
            accent="#db2777"
            onClick={() => push('scanner')}
          />
          <SaRow
            icon={Sparkles}
            title="Quiz"
            subtitle="Quick practice"
            accent="#d97706"
            onClick={() => push('gk-quiz')}
          />
          <SaRow
            icon={CalendarDays}
            title="Calendar"
            subtitle="Exams and school events"
            onClick={() => push('calendar')}
          />
        </div>
      </SaSection>
    </div>
  )
}

function StatTile({
  label,
  value,
  onClick,
}: {
  label: string
  value: number
  onClick: () => void
}) {
  return (
    <SaCard className="p-3.5 text-center space-y-1" onClick={onClick}>
      <p className="text-2xl font-black text-[var(--accent)] tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide">{label}</p>
    </SaCard>
  )
}
