import { useEffect, useRef, useState } from 'react'
import { Download, Upload, Users } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { exportAttendanceCsv, exportGradesCsv } from '../../lib/dataExport'
import { importRosterCsv, ROSTER_CSV_TEMPLATE } from '../../lib/rosterImport'
import { fetchRosterWithTodayAttendance, ROSTER_PAGE_SIZE, setStudentActive } from '../../lib/attendanceApi'
import {
  assignTeacherClass,
  fetchSchoolTeachers,
  fetchTeacherClasses,
  removeTeacherClass,
  type TeacherClassRow,
  type TeacherProfileOption,
} from '../../lib/teacherClassesApi'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import { readSchoolPolicy } from '../../lib/schoolPolicy'
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
  const [teachers, setTeachers] = useState<TeacherProfileOption[]>([])
  const [teacherClasses, setTeacherClasses] = useState<TeacherClassRow[]>([])
  const [assignTeacherId, setAssignTeacherId] = useState('')
  const [assignClass, setAssignClass] = useState(() => readSchoolPolicy().classLabel)
  const [rosterHasMore, setRosterHasMore] = useState(false)
  const [loadingMoreRoster, setLoadingMoreRoster] = useState(false)
  const t = (key: string) => translate(lang, key)

  useEffect(() => {
    setRosterHasMore(roster.length >= ROSTER_PAGE_SIZE)
  }, [roster.length])

  const reloadTeacherClasses = () => {
    if (!isSupabaseConfigured() || !classLinked) return
    void Promise.all([fetchSchoolTeachers(), fetchTeacherClasses()]).then(([staff, rows]) => {
      setTeachers(staff)
      setTeacherClasses(rows)
      if (!assignTeacherId && staff[0]?.id) setAssignTeacherId(staff[0].id)
    })
  }

  useEffect(() => {
    reloadTeacherClasses()
  }, [classLinked])

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

  const onExport = async (kind: 'attendance' | 'grades') => {
    const result = kind === 'attendance' ? await exportAttendanceCsv() : await exportGradesCsv()
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(
      t(kind === 'attendance' ? 'exportAttendanceDone' : 'exportGradesDone').replace(
        '{count}',
        String(result.count),
      ),
    )
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
    triggerToast(
      t('rosterImported')
        .replace('{count}', String(result.imported + result.updated))
        .replace('{new}', String(result.imported))
        .replace('{updated}', String(result.updated)),
    )
    useOrbitStore.setState({ roster: result.roster })
    void hydrateFromSupabase()
  }

  const onToggleActive = async (studentId: string, active: boolean) => {
    const result = await setStudentActive(studentId, active)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    useOrbitStore.setState((s) => ({
      roster: s.roster.map((row) => (row.id === studentId ? { ...row, active } : row)),
    }))
    triggerToast(active ? t('studentReactivated') : t('studentDeactivated'))
  }

  const onLoadMoreRoster = async () => {
    setLoadingMoreRoster(true)
    const next = await fetchRosterWithTodayAttendance({
      activeClassOnly: false,
      includeInactive: true,
      offset: roster.length,
      limit: ROSTER_PAGE_SIZE,
    })
    setLoadingMoreRoster(false)
    if (!next.length) {
      setRosterHasMore(false)
      return
    }
    useOrbitStore.setState((s) => {
      const seen = new Set(s.roster.map((r) => r.id))
      return { roster: [...s.roster, ...next.filter((r) => !seen.has(r.id))] }
    })
    setRosterHasMore(next.length === ROSTER_PAGE_SIZE)
  }

  const onAssignTeacherClass = async () => {
    const label = assignClass.trim()
    const match = label.match(/^(.*?)[-–]([A-Za-z0-9]+)$/)
    const className = (match?.[1] || label).trim()
    const section = match?.[2]?.trim() || null
    const result = await assignTeacherClass({
      teacherProfileId: assignTeacherId,
      className,
      section,
    })
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(t('teacherClassAssigned'))
    reloadTeacherClasses()
  }

  if (!classLinked) {
    return (
      <Panel title={t('schoolRosterTitle')} subtitle={t('schoolRosterDesc')}>
        <EmptyState title={t('noClassLinkedTitle')} description={t('noClassLinkedDesc')} />
      </Panel>
    )
  }

  return (
    <div className="space-y-6">
    <Panel
      title={t('schoolRosterTitle')}
      subtitle={t('schoolRosterDesc')}
      action={
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={() => void onExport('attendance')}
            className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t('exportAttendanceCsv')}
          </button>
          <button
            type="button"
            onClick={() => void onExport('grades')}
            className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t('exportGradesCsv')}
          </button>
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
                    {student.classLabel || 'No class'}
                    {' · '}
                    {t('rollLabel')} {student.rollNo || '—'}
                    {student.section == null || student.section === '' ? ' · No section' : ''}
                    {student.isDemo ? ` · ${t('demoMode')}` : ''}
                  </Eyebrow>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    student.active === false
                      ? 'bg-slate-500/15 text-slate-400 border-slate-500/25'
                      : student.present
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                  }`}
                >
                  {student.active === false
                    ? t('inactiveStudent')
                    : student.present
                      ? t('present')
                      : t('absent')}
                </span>
                <button
                  type="button"
                  onClick={() => void onToggleActive(student.id, student.active === false)}
                  className="btn-ghost px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300"
                >
                  {student.active === false ? t('reactivateStudent') : t('deactivateStudent')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {rosterHasMore ? (
        <button
          type="button"
          disabled={loadingMoreRoster}
          onClick={() => void onLoadMoreRoster()}
          className="btn-ghost w-full mt-3 px-3 py-2 rounded-xl text-xs font-bold text-white"
        >
          {loadingMoreRoster ? 'Loading…' : 'Load more students'}
        </button>
      ) : null}
    </Panel>

    {isSupabaseConfigured() ? (
      <Panel title={t('teacherClassesTitle')} subtitle={t('teacherClassesHint')}>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={assignTeacherId}
            onChange={(e) => setAssignTeacherId(e.target.value)}
            className="field flex-1 rounded-xl px-3 py-2 text-sm"
          >
            {teachers.length === 0 ? (
              <option value="">No teachers</option>
            ) : (
              teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))
            )}
          </select>
          <input
            value={assignClass}
            onChange={(e) => setAssignClass(e.target.value)}
            className="field flex-1 rounded-xl px-3 py-2 text-sm"
            placeholder="Grade 8-A"
          />
          <button
            type="button"
            disabled={!assignTeacherId || !assignClass.trim()}
            onClick={() => void onAssignTeacherClass()}
            className="btn-accent px-3 py-2 rounded-xl text-xs font-bold"
          >
            {t('assignTeacherClass')}
          </button>
        </div>
        <div className="space-y-2">
          {teacherClasses.map((row) => {
            const teacher = teachers.find((tRow) => tRow.id === row.teacherProfileId)
            const label = row.section ? `${row.className}-${row.section}` : row.className
            return (
              <Card key={row.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{teacher?.name || row.teacherProfileId}</p>
                  <Eyebrow>{label}</Eyebrow>
                </div>
                <button
                  type="button"
                  className="btn-ghost px-2 py-1 rounded-lg text-[10px] font-bold text-slate-300"
                  onClick={() =>
                    void removeTeacherClass(row.id).then((result) => {
                      if (!result.ok) triggerToast(result.error)
                      else reloadTeacherClasses()
                    })
                  }
                >
                  Remove
                </button>
              </Card>
            )
          })}
        </div>
      </Panel>
    ) : null}
    </div>
  )
}
