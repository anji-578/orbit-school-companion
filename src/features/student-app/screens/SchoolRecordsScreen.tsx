import { useEffect } from 'react'
import { useOrbitStore } from '../../../store/orbitStore'
import { fetchStaffDirectory } from '../../../lib/staffApi'
import { SaSection } from '../components/SaUi'
import { useStudentNav } from '../StudentNavContext'
import { ICON, IconTile, ProgressBar } from '@/shared/ui/orbit'

/** Administrative records — secondary to identity on Me. */
export function SchoolRecordsScreen() {
  const { push } = useStudentNav()
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const teachers = useOrbitStore((s) => s.teachers)
  useEffect(() => {
    void (async () => {
      const rows = await fetchStaffDirectory()
      if (rows.length) useOrbitStore.setState({ teachers: rows })
    })()
  }, [])
  const attendancePct = getAttendancePercent()
  const Chevron = ICON.chrome.chevron

  const rows = [
    {
      icon: ICON.me.active,
      tone: 'orange' as const,
      title: 'Attendance',
      meta: `${attendancePct}% overall`,
      go: () => push('attendance'),
    },
    {
      icon: ICON.tool.progress,
      tone: 'blue' as const,
      title: 'Progress reports',
      meta: 'Marks and teacher feedback',
      go: () => push('academics'),
    },
    {
      icon: ICON.me.school,
      tone: 'green' as const,
      title: 'My teachers',
      meta: `${teachers.length} teachers`,
      go: () => push('teachers'),
    },
    {
      icon: ICON.me.personal,
      tone: 'purple' as const,
      title: 'Learning profile',
      meta: 'Strengths, skills, and interests',
      go: () => push('profile'),
    },
  ]

  return (
    <div className="space-y-5 pb-4">
      <p className="px-0.5 text-[13px] leading-relaxed text-o-muted">
        School-managed records. Your growth story lives on Me — this is the paperwork layer.
      </p>
      <SaSection eyebrow="Records">
        <div className="o-card divide-y divide-o-border p-1">
          {rows.map((row) => (
            <button
              key={row.title}
              type="button"
              onClick={row.go}
              className="o-focus flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left active:scale-[0.98]"
            >
              <IconTile icon={row.icon} tone={row.tone} size="md" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-o-text">{row.title}</span>
                <span className="text-[13px] text-o-muted">{row.meta}</span>
              </span>
              <Chevron className="h-4 w-4 text-o-faint" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </SaSection>
      <div className="o-card space-y-2 p-4">
        <p className="text-[13px] text-o-muted">Attendance this term</p>
        <ProgressBar value={attendancePct} height={4} label="Attendance overall" />
      </div>
    </div>
  )
}
