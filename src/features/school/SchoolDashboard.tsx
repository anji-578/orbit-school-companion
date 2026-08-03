import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Bell, Briefcase, Calendar, CalendarDays, Copy, CreditCard, KeyRound, Plus, Truck, Users } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { createClassInvite, fetchSchoolInviteCodes } from '../../lib/classLink'
import { exportAttendanceCsv, exportGradesCsv } from '../../lib/dataExport'
import { fetchAuditLog, type AuditRow } from '../../lib/auditApi'
import { readSchoolPolicy, saveSchoolPolicy } from '../../lib/schoolPolicy'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'
import { Card, Eyebrow, Panel, StatTile } from '../../components/ui/primitives'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'

type InviteRow = { code: string; role: string; className: string | null; uses: string }

export function SchoolDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const fees = useOrbitStore((s) => s.fees)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const candidates = useOrbitStore((s) => s.candidates)
  const leaves = useOrbitStore((s) => s.leaves)
  const fleet = useOrbitStore((s) => s.fleet)
  const broadcasts = useOrbitStore((s) => s.broadcasts)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [invites, setInvites] = useState<InviteRow[]>([])
  const [inviteRole, setInviteRole] = useState<'student' | 'parent' | 'teacher' | 'school'>('parent')
  const [inviteClass, setInviteClass] = useState(() => readSchoolPolicy().classLabel)
  const [inviteStudentId, setInviteStudentId] = useState('')
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [auditRows, setAuditRows] = useState<AuditRow[]>([])
  const roster = useOrbitStore((s) => s.roster)

  const t = (key: string) => translate(lang, key)
  const activeBuses = fleet.filter((b) => b.active).length
  const pendingLeaves = leaves.filter((l) => l.status === 'Reviewing').length
  const unpaidFees = fees.filter((f) => f.status !== 'Paid').length

  const loadInvites = () => {
    if (!isSupabaseConfigured() || !classLinked) return
    void fetchSchoolInviteCodes().then(setInvites)
  }

  useEffect(() => {
    loadInvites()
    if (isSupabaseConfigured() && classLinked) {
      void fetchAuditLog(12).then(setAuditRows)
    }
  }, [classLinked])

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      triggerToast(t('inviteCopied'))
    } catch {
      triggerToast(code)
    }
  }

  const onCreateInvite = async (e: FormEvent) => {
    e.preventDefault()
    setCreatingInvite(true)
    const linkChild = inviteRole === 'student' || inviteRole === 'parent'
    const result = await createClassInvite({
      role: inviteRole,
      className: inviteClass.trim() || undefined,
      studentId: linkChild && inviteStudentId ? inviteStudentId : undefined,
    })
    setCreatingInvite(false)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(t('inviteCreated'))
    loadInvites()
    void copyCode(result.code)
  }

  /** Create one parent invite per active roster student (bulk onboarding). */
  const onBulkParentInvites = async () => {
    const active = roster.filter((s) => s.active !== false)
    if (!active.length) {
      triggerToast(t('rosterEmptyTitle'))
      return
    }
    setCreatingInvite(true)
    let okCount = 0
    for (const student of active.slice(0, 40)) {
      const result = await createClassInvite({
        role: 'parent',
        className: student.classLabel || inviteClass.trim() || undefined,
        studentId: student.id,
        maxUses: 2,
      })
      if (result.ok) okCount += 1
    }
    setCreatingInvite(false)
    triggerToast(t('bulkInvitesDone').replace('{count}', String(okCount)))
    loadInvites()
  }

  const onExport = async (kind: 'attendance' | 'grades') => {
    setExportBusy(true)
    const result = kind === 'attendance' ? await exportAttendanceCsv() : await exportGradesCsv()
    setExportBusy(false)
    if (!result.ok) {
      triggerToast(result.error)
      return
    }
    triggerToast(t(kind === 'attendance' ? 'exportAttendanceDone' : 'exportGradesDone').replace('{count}', String(result.count)))
  }

  return (
    <div className="space-y-6">
      <Panel title={t('schoolPolicyTitle')} subtitle={t('schoolPolicyDesc')}>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="space-y-1 block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('activeClassLabel')}</span>
            <input
              type="text"
              value={inviteClass}
              onChange={(e) => setInviteClass(e.target.value)}
              onBlur={() => {
                void saveSchoolPolicy({ classLabel: inviteClass }).then((result) => {
                  triggerToast(result.ok ? t('schoolPolicySaved') : result.error || t('schoolPolicySaved'))
                })
              }}
              className="field w-full rounded-lg px-3 py-2.5 text-sm"
              placeholder="e.g. Grade 8-A"
            />
          </label>
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{t('dataExportTitle')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={exportBusy}
                onClick={() => void onExport('attendance')}
                className="btn-ghost px-3 py-2 rounded-xl text-[11px] font-bold text-white"
              >
                {t('exportAttendanceCsv')}
              </button>
              <button
                type="button"
                disabled={exportBusy}
                onClick={() => void onExport('grades')}
                className="btn-ghost px-3 py-2 rounded-xl text-[11px] font-bold text-white"
              >
                {t('exportGradesCsv')}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">{t('dataExportHint')}</p>
          </div>
        </div>
      </Panel>

      {!classLinked ? <InviteRedeemCard /> : null}

      {classLinked && isSupabaseConfigured() ? (
        <Panel title={t('classInvitesTitle')} subtitle={t('classInvitesDesc')}>
          <form onSubmit={onCreateInvite} className="flex flex-col gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('createInviteRole')}</span>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="field w-full rounded-xl px-3 py-2 text-sm"
                >
                  <option value="student">student</option>
                  <option value="parent">parent</option>
                  <option value="teacher">teacher</option>
                  <option value="school">school</option>
                </select>
              </label>
              <label className="flex-[2] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('createInviteClass')}</span>
                <input
                  value={inviteClass}
                  onChange={(e) => setInviteClass(e.target.value)}
                  className="field w-full rounded-xl px-3 py-2 text-sm"
                  placeholder={t('createInviteClassPlaceholder')}
                />
              </label>
            </div>
            {inviteRole === 'student' || inviteRole === 'parent' ? (
              <label className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('createInviteStudent')}
                </span>
                <select
                  value={inviteStudentId}
                  onChange={(e) => setInviteStudentId(e.target.value)}
                  className="field w-full rounded-xl px-3 py-2 text-sm"
                >
                  <option value="">{t('createInviteStudentAny')}</option>
                  {roster.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.classLabel ? ` · ${s.classLabel}` : ''}
                      {s.rollNo ? ` · Roll ${s.rollNo}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={creatingInvite}
                className="btn-accent self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                {creatingInvite ? t('redeemingInvite') : t('createInvite')}
              </button>
              <button
                type="button"
                disabled={creatingInvite || roster.length === 0}
                onClick={() => void onBulkParentInvites()}
                className="btn-ghost self-start inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white"
              >
                Bulk parent invites
              </button>
            </div>
          </form>

          {invites.length > 0 ? (
            <div className="space-y-2.5">
              {invites.map((inv) => (
                <Card key={inv.code} className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    <KeyRound className="h-4 w-4 text-[var(--accent2)] shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white font-mono truncate">{inv.code}</p>
                      <p className="text-[10px] text-slate-400">
                        {inv.role}
                        {inv.className ? ` · ${inv.className}` : ''} · {inv.uses} uses
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyCode(inv.code)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    {t('copy')}
                  </button>
                </Card>
              ))}
            </div>
          ) : null}
        </Panel>
      ) : null}

      {classLinked && isSupabaseConfigured() && auditRows.length > 0 ? (
        <Panel title="Activity log" subtitle="Recent school mutations (fees, leave, roster, attendance).">
          <div className="space-y-2">
            {auditRows.map((row) => (
              <Card key={row.id} className="p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{row.action}</p>
                  <Eyebrow>
                    {row.entityType}
                    {row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ''}
                  </Eyebrow>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(row.createdAt).toLocaleString()}
                </span>
              </Card>
            ))}
          </div>
        </Panel>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label={t('schoolFeeAuditorTitle')}
          value={outstandingFees > 0 ? `₹${outstandingFees.toLocaleString()}` : 'Cleared'}
          hint={`${unpaidFees} unpaid invoices`}
          accent={outstandingFees > 0 ? '#FF6B8B' : '#22C55E'}
          onClick={() => setActiveTab('school-fees')}
        />
        <StatTile
          label={t('schoolHiringTitle')}
          value={String(candidates.length)}
          hint="Active applicants"
          onClick={() => setActiveTab('school-hiring')}
        />
        <StatTile
          label={t('teacherLeavesTitle')}
          value={String(pendingLeaves)}
          hint="Pending review"
          onClick={() => setActiveTab('school-leaves')}
        />
        <StatTile
          label={t('schoolFleetTitle')}
          value={`${activeBuses}/${fleet.length}`}
          hint="Buses active"
          onClick={() => setActiveTab('school-fleet')}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t('schoolBroadcastingTitle')} subtitle={t('schoolBroadcastingDesc')}>
          <div className="space-y-2.5">
            {broadcasts.slice(0, 4).map((msg) => (
              <Card key={msg.id} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-white">{msg.title}</p>
                  <span className="text-[9px] text-slate-500 shrink-0">{msg.date}</span>
                </div>
                <p className="text-[10px] text-slate-400">{msg.content}</p>
                <Eyebrow>To: {msg.target}</Eyebrow>
              </Card>
            ))}
          </div>
        </Panel>

        <Panel title={t('schoolCalendarTitle')} subtitle={t('schoolCalendarDesc')}>
          <div className="space-y-2.5">
            {calendarEvents.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CalendarDays className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{event.title}</p>
                    <p className="text-[10px] text-slate-400">{event.date}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-white/10 text-slate-300 shrink-0">
                  {event.category}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {[
          { icon: CreditCard, key: 'schoolFeeAuditorTitle', tab: 'school-fees' },
          { icon: Users, key: 'schoolRosterTitle', tab: 'school-roster' },
          { icon: Calendar, key: 'schoolTimetableTitle', tab: 'school-timetable' },
          { icon: CalendarDays, key: 'schoolLeavesTitle', tab: 'school-leaves' },
          { icon: Briefcase, key: 'schoolHiringTitle', tab: 'school-hiring' },
          { icon: Bell, key: 'schoolBroadcastingTitle', tab: 'school-broadcast' },
          { icon: Truck, key: 'schoolFleetTitle', tab: 'school-fleet' },
        ].map(({ icon: Icon, key, tab }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="glass glass-hover rounded-2xl p-4 flex items-center gap-3 text-left"
          >
            <Icon className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
            <span className="text-xs font-bold text-white">{t(key)}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500 ml-auto" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  )
}
