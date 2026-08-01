import { Users } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'
import { EmptyState } from '../../components/ui/EmptyState'

/** Light class roster for school — seeded students + today's attendance snapshot. */
export function SchoolRoster() {
  const lang = useOrbitStore((s) => s.lang)
  const roster = useOrbitStore((s) => s.roster)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const t = (key: string) => translate(lang, key)

  const present = roster.filter((r) => r.present).length
  const absent = roster.length - present

  if (!classLinked) {
    return (
      <Panel title={t('schoolRosterTitle')} subtitle={t('schoolRosterDesc')}>
        <EmptyState title={t('noClassLinkedTitle')} description={t('noClassLinkedDesc')} />
      </Panel>
    )
  }

  return (
    <Panel title={t('schoolRosterTitle')} subtitle={t('schoolRosterDesc')}>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile label={t('classSize')} value={String(roster.length)} />
        <StatTile label={t('present')} value={String(present)} accent="#22C55E" />
        <StatTile label={t('absent')} value={String(absent)} accent={absent > 0 ? '#FF6B8B' : undefined} />
      </div>

      {roster.length === 0 ? (
        <EmptyState
          title={t('rosterEmptyTitle')}
          description={t('rosterEmptyDesc')}
          icon={<Users className="h-5 w-5" aria-hidden />}
        />
      ) : (
        <div className="space-y-2.5">
          {roster.map((student, idx) => (
            <Card key={student.id} className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                  {student.rollNo || String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{student.name}</p>
                  <Eyebrow>
                    {t('rollLabel')} {student.rollNo || '—'}
                    {student.isDemo ? ` · ${t('demoMode')}` : ''}
                  </Eyebrow>
                </div>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                  student.present
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                }`}
              >
                {student.present ? t('present') : t('absent')}
              </span>
            </Card>
          ))}
        </div>
      )}
    </Panel>
  )
}
