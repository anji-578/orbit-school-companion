import { useMemo } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  Users,
} from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { curriculumProgress, useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Card, Eyebrow, Panel, StatTile } from '../../components/ui/primitives'

type AttentionKind = 'absent' | 'homework' | 'struggle' | 'excellent'

type AttentionRow = {
  id: string
  name: string
  kind: AttentionKind
  detail: string
}

/**
 * Teacher home answers: “Who needs my attention?”
 */
export function TeacherDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const roster = useOrbitStore((s) => s.roster)
  const tasks = useOrbitStore((s) => s.tasks)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const curriculum = useOrbitStore((s) => s.curriculum)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const displayName = useAuthStore((s) => s.session?.displayName)
  const firstName = (displayName ?? 'Teacher').split(' ')[0]

  const t = (key: string) => translate(lang, key)
  const presentCount = roster.filter((r) => r.present).length
  const pendingHw = tasks.filter((task) => !task.completed)
  const syllabusPct = curriculumProgress(curriculum)

  const attentionList = useMemo((): AttentionRow[] => {
    const rows: AttentionRow[] = []
    const active = roster.filter((r) => r.active !== false)

    for (const student of active) {
      const first = student.name.split(' ')[0]
      if (!student.present) {
        rows.push({
          id: `${student.id}-abs`,
          name: first,
          kind: 'absent',
          detail: t('teacherAbsentToday'),
        })
        continue
      }
    }

    // Homework pressure — flag a couple of present students when class HW is open
    if (pendingHw.length > 0) {
      const present = active.filter((r) => r.present).slice(0, 2)
      for (const student of present) {
        rows.push({
          id: `${student.id}-hw`,
          name: student.name.split(' ')[0],
          kind: 'homework',
          detail: t('teacherHomeworkMissing'),
        })
      }
    }

    // Concept struggle from grade rows (name match)
    for (const g of studentGrades) {
      const chem = Number(String(g.chem).split('/')[0])
      const math = Number(String(g.math).split('/')[0])
      const totalChem = Number(String(g.chem).split('/')[1]) || 50
      const totalMath = Number(String(g.math).split('/')[1]) || 50
      const chemPct = Math.round((chem / totalChem) * 100)
      const mathPct = Math.round((math / totalMath) * 100)
      const weak =
        chemPct < mathPct
          ? { topic: t('chemLabSubject'), pct: chemPct }
          : { topic: t('mathSubject'), pct: mathPct }
      if (weak.pct < 70) {
        const first = g.name.split(' ')[0]
        if (!rows.some((r) => r.name === first && r.kind === 'struggle')) {
          rows.push({
            id: `${g.id}-struggle`,
            name: first,
            kind: 'struggle',
            detail: t('teacherConceptStruggle').replace('{topic}', weak.topic),
          })
        }
      } else if (mathPct >= 90 && chemPct >= 80) {
        const first = g.name.split(' ')[0]
        rows.push({
          id: `${g.id}-ex`,
          name: first,
          kind: 'excellent',
          detail: t('teacherExcellentProgress'),
        })
      }
    }

    // If roster shows everyone present and no grade signal, still show one celebrate + keep list lean
    if (rows.length === 0 && active[0]) {
      rows.push({
        id: `${active[0].id}-ex`,
        name: active[0].name.split(' ')[0],
        kind: 'excellent',
        detail: t('teacherExcellentProgress'),
      })
    }

    const seen = new Set<string>()
    return rows
      .filter((r) => {
        const k = `${r.name}-${r.kind}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .slice(0, 6)
  }, [roster, pendingHw.length, studentGrades, lang])

  const needsHelp = attentionList.filter((r) => r.kind !== 'excellent')
  const celebrating = attentionList.filter((r) => r.kind === 'excellent')

  const kindStyle = (kind: AttentionKind) => {
    switch (kind) {
      case 'absent':
        return 'border-rose-500/30 bg-rose-500/10'
      case 'homework':
        return 'border-orange-500/30 bg-orange-500/10'
      case 'struggle':
        return 'border-amber-500/30 bg-amber-500/10'
      case 'excellent':
        return 'border-emerald-500/30 bg-emerald-500/10'
    }
  }

  const kindIcon = (kind: AttentionKind) => {
    switch (kind) {
      case 'absent':
        return <AlertTriangle className="h-4 w-4 text-rose-300" aria-hidden />
      case 'homework':
        return <ClipboardList className="h-4 w-4 text-orange-300" aria-hidden />
      case 'struggle':
        return <BookOpen className="h-4 w-4 text-amber-300" aria-hidden />
      case 'excellent':
        return <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-2 border-[var(--accent)]/25">
        <Eyebrow>{t('teacherMorningEyebrow')}</Eyebrow>
        <h2 className="text-lg font-extrabold text-white font-display">
          {t('teacherAttentionTitle')}
        </h2>
        <p className="text-xs text-slate-400">
          {t('teacherAttentionSub').replace('{name}', firstName)}
        </p>
      </Card>

      <Panel title={t('teacherNeedsHelp')} subtitle={t('teacherNeedsHelpSub')}>
        {needsHelp.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">{t('teacherAllClear')}</p>
        ) : (
          <div className="space-y-2">
            {needsHelp.map((row) => (
              <div
                key={row.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${kindStyle(row.kind)}`}
              >
                {kindIcon(row.kind)}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{row.name}</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {celebrating.length > 0 ? (
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t('teacherCelebrate')}
            </p>
            {celebrating.map((row) => (
              <div
                key={row.id}
                className={`flex items-start gap-3 p-3 rounded-xl border ${kindStyle(row.kind)}`}
              >
                {kindIcon(row.kind)}
                <div>
                  <p className="text-sm font-bold text-white">{row.name}</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label={t('classPresent')}
          value={`${presentCount}/${roster.length}`}
          onClick={() => setActiveTab('teacher-attendance')}
        />
        <StatTile
          label={t('teacherSyllabusTitle')}
          value={`${syllabusPct}%`}
          onClick={() => setActiveTab('teacher-syllabus')}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('teacher-attendance')}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left"
        >
          <Users className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
          <div>
            <p className="text-xs font-bold text-white">{t('markAttendance')}</p>
            <p className="text-[10px] text-slate-500">{t('teacherAutoHint')}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('teacher-homework')}
          className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left"
        >
          <ClipboardList className="h-5 w-5 text-[var(--health-warn)]" aria-hidden />
          <div>
            <p className="text-xs font-bold text-white">{t('teacherHomeworkTitle')}</p>
            <p className="text-[10px] text-slate-500">
              {t('teacherHwPending').replace('{count}', String(pendingHw.length))}
            </p>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setActiveTab('scanner')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border border-violet-500/30"
        style={{ color: 'var(--ai-hint)' }}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        {t('teacherAiCoach')}
      </button>
    </div>
  )
}
