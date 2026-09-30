import { BookOpen, CalendarCheck, ChevronRight, GraduationCap, Users } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'

/** Administrative records — secondary to identity on Me. */
export function SchoolRecordsScreen() {
  const { push } = useStudentNav()
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const teachers = useOrbitStore((s) => s.teachers)
  const attendancePct = getAttendancePercent()

  return (
    <div className="space-y-5 pb-4">
      <div className="px-0.5">
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          School-managed records. Your growth story lives on Me — this is the paperwork layer.
        </p>
      </div>

      <SaSection eyebrow="Records">
        <div className="space-y-2">
          <RecordLink
            icon={CalendarCheck}
            title="Attendance"
            meta={`${attendancePct}% overall`}
            onClick={() => push('attendance')}
          />
          <RecordLink
            icon={BookOpen}
            title="Progress reports"
            meta="Marks and teacher feedback"
            onClick={() => push('academics')}
          />
          <RecordLink
            icon={Users}
            title="My teachers"
            meta={`${teachers.length} teachers`}
            onClick={() => push('teachers')}
          />
          <RecordLink
            icon={GraduationCap}
            title="Learning profile"
            meta="Strengths, skills, and interests"
            onClick={() => push('profile')}
          />
        </div>
      </SaSection>
    </div>
  )
}

function RecordLink({
  icon: Icon,
  title,
  meta,
  onClick,
}: {
  icon: typeof BookOpen
  title: string
  meta?: string
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
        {meta ? <span className="text-[11px] text-[var(--muted)]">{meta}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 text-[var(--muted)]" aria-hidden />
    </button>
  )
}
