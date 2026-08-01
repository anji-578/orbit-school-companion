import { useRef, useState } from 'react'
import { Download, Upload, Users } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { importRosterCsv, ROSTER_CSV_TEMPLATE } from '../../lib/rosterImport'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'
import { EmptyState } from '../../components/ui/EmptyState'

/** Class roster + CSV import for go-live migration. */
export function SchoolRoster() {
  const lang = useOrbitStore((s) => s.lang)
  const roster = useOrbitStore((s) => s.roster)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const hydrateFromSupabase = useOrbitStore((s) => s.hydrateFromSupabase)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const t = (key: string) => translate(lang, key)

  const present = roster.filter((r) => r.present).length
  const absent = roster.length - present

  const downloadTemplate = () => {
    const blob = new Blob([ROSTER_CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orbit-roster-template.csv'
    a.click()
    URL.revokeObjectURL(url)
    triggerToast(t('rosterTemplateDownloaded'))
  }

  const onFile = async (file: File | null) => {
    if (!file) return
    setImporting(true)
    const text = await file.text()
    const result = await importRosterCsv(text)
    setImporting(false)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(t('rosterImported').replace('{count}', String(result.imported)))
    useOrbitStore.setState({ roster: result.roster })
    void hydrateFromSupabase()
  }

  if (!classLinked) {
    return (
      <Panel title={t('schoolRosterTitle')} subtitle={t('schoolRosterDesc')}>
        <EmptyState title={t('noClassLinkedTitle')} description={t('noClassLinkedDesc')} />
      </Panel>
    )
  }

  return (
    <Panel
      title={t('schoolRosterTitle')}
      subtitle={t('schoolRosterDesc')}
      action={
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={downloadTemplate}
            className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t('downloadRosterTemplate')}
          </button>
          <button
            type="button"
            disabled={importing}
            onClick={() => fileRef.current?.click()}
            className="btn-accent flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            {importing ? t('importingRoster') : t('importRosterCsv')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </div>
      }
    >
      <p className="text-[11px] text-slate-400 -mt-2 mb-2">{t('rosterImportHint')}</p>

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
