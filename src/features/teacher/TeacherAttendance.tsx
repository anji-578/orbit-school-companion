import { Megaphone, UserCheck, UserX } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, StatTile } from '../../components/ui/primitives'

export function TeacherAttendance() {
  const lang = useOrbitStore((s) => s.lang)
  const roster = useOrbitStore((s) => s.roster)
  const toggleRosterPresent = useOrbitStore((s) => s.toggleRosterPresent)
  const broadcastAbsentees = useOrbitStore((s) => s.broadcastAbsentees)

  const t = (key: string) => translate(lang, key)
  const presentCount = roster.filter((r) => r.present).length
  const absentCount = roster.length - presentCount

  return (
    <Panel
      title={t('teacherAttendanceTitle')}
      subtitle={t('teacherAttendanceDesc')}
      action={
        <button
          type="button"
          onClick={broadcastAbsentees}
          className="btn-accent flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
        >
          <Megaphone className="h-3.5 w-3.5" aria-hidden />
          {t('broadcastAbsentees')}
        </button>
      }
    >
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile label="Roster" value={String(roster.length)} />
        <StatTile label={t('present')} value={String(presentCount)} accent="#22C55E" />
        <StatTile label={t('absent')} value={String(absentCount)} accent="#FF6B8B" />
      </div>

      <div className="space-y-2.5">
        {roster.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                  student.present ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {student.present ? <UserCheck className="h-4 w-4" aria-hidden /> : <UserX className="h-4 w-4" aria-hidden />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{student.name}</p>
                {student.isDemo ? <p className="text-[9px] text-[var(--accent2)] font-bold">Synced live demo</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleRosterPresent(student.id)}
              aria-pressed={student.present}
              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition shrink-0 ${
                student.present
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/25 hover:bg-rose-500/25'
              }`}
            >
              {student.present ? t('present') : t('absent')}
            </button>
          </div>
        ))}
      </div>
    </Panel>
  )
}
