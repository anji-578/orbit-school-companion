import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { childDisplayName } from '../../lib/linkedStudent'
import { ChildSwitcher } from '../../components/ui/ChildSwitcher'
import { Panel, StatTile } from '../../components/ui/primitives'

const CHRONIC_ABSENT_THRESHOLD = 3

/** Parent read-only view of linked child attendance (synced from teacher). */
export function ParentAttendance() {
  const lang = useOrbitStore((s) => s.lang)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)

  const t = (key: string) => translate(lang, key)
  const childName = childDisplayName(linkedStudent, t('noChildLinkedTitle'))
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length
  const absentCount = attendanceRecords.length - presentCount
  const chronic = absentCount >= CHRONIC_ABSENT_THRESHOLD

  return (
    <Panel title={t('parentAttendanceTitle')} subtitle={t('parentAttendanceDesc').replace('{name}', childName)}>
      <ChildSwitcher compact />
      {chronic ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-300 shrink-0 mt-0.5" aria-hidden />
          <p className="text-[11px] text-rose-100 font-semibold leading-snug">
            High absences: {absentCount} days marked absent in the recent window. Contact the class teacher if this
            continues.
          </p>
        </div>
      ) : null}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile label={t('studentAttendance')} value={`${getAttendancePercent()}%`} accent="var(--accent2)" />
        <StatTile label={t('present')} value={String(presentCount)} />
        <StatTile label={t('absent')} value={String(absentCount)} />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
        {attendanceRecords.map((record) => (
          <div
            key={record.date}
            className={`rounded-xl border p-3 text-center ${
              record.status === 'Present'
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : 'bg-rose-500/10 border-rose-500/25'
            }`}
          >
            <p className="text-[9px] font-bold text-slate-400 uppercase">{record.day}</p>
            <p className="text-[10px] font-bold text-white mt-1">{record.date}</p>
            {record.status === 'Present' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mt-1.5" aria-hidden />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400 mx-auto mt-1.5" aria-hidden />
            )}
            {record.reason ? <p className="text-[8px] text-slate-500 mt-1 leading-tight">{record.reason}</p> : null}
          </div>
        ))}
      </div>
    </Panel>
  )
}
