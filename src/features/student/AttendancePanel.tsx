import { CheckCircle2, XCircle } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, StatTile } from '../../components/ui/primitives'

/** Student attendance is read-only — only teachers mark attendance. */
export function AttendancePanel() {
  const lang = useOrbitStore((s) => s.lang)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)

  const t = (key: string) => translate(lang, key)
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length
  const absentCount = attendanceRecords.length - presentCount

  return (
    <Panel title={t('studentAttendance')} subtitle={t('studentAttendanceDesc')}>
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
