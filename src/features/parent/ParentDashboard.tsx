import { useMemo } from 'react'
import {
  BookOpen,
  Bus,
  CheckCircle2,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { childDisplayName, childFirstName } from '../../lib/linkedStudent'
import { Card, Eyebrow, Panel } from '../../components/ui/primitives'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { ChildSwitcher } from '../../components/ui/ChildSwitcher'

const SUBJECT_ROWS: { field: 'math' | 'science' | 'chem'; subjectKey: string }[] = [
  { field: 'math', subjectKey: 'mathSubject' },
  { field: 'science', subjectKey: 'scienceSubject' },
  { field: 'chem', subjectKey: 'chemLabSubject' },
]

function percentOf(raw: string): number {
  const [obtained, total] = raw.split('/').map(Number)
  if (!total) return 0
  return Math.round((obtained / total) * 100)
}

/**
 * Parent home answers: “Is my child doing okay?”
 * Safe · Learning · Happy · Do I need to act today?
 */
export function ParentDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const linkedStudent = useOrbitStore((s) => s.linkedStudent)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const tasks = useOrbitStore((s) => s.tasks)
  const fees = useOrbitStore((s) => s.fees)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const fleet = useOrbitStore((s) => s.fleet)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const notifications = useOrbitStore((s) => s.notifications)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  const t = (key: string) => translate(lang, key)
  const childName = childFirstName(linkedStudent, childDisplayName(linkedStudent, t('yourChild')))
  const attendance = getAttendancePercent()
  const pendingHw = tasks.filter((task) => !task.completed)
  const homeworkOk = pendingHw.length === 0
  const attendedOk = attendance >= 75
  const busOk = fleet.length > 0
  const unpaid = fees.filter((f) => f.status !== 'Paid')
  const grade = studentGrades[0]
  const doingWell = attendedOk && (homeworkOk || pendingHw.length <= 1)

  const learningSummary = useMemo(() => {
    if (!grade) return []
    return SUBJECT_ROWS.map((row) => {
      const pct = percentOf(grade[row.field])
      return {
        subject: t(row.subjectKey),
        understood: pct >= 75,
        pct,
      }
    })
  }, [grade, lang])

  const suggestedAction = (() => {
    if (!grade) {
      return pendingHw[0]
        ? t('parentSuggestHomework')
            .replace('{subject}', pendingHw[0].subject)
            .replace('{task}', pendingHw[0].task || pendingHw[0].subject)
        : t('parentSuggestNone')
    }
    const weakest = SUBJECT_ROWS.map((row) => ({
      ...row,
      percent: percentOf(grade[row.field]),
    })).sort((a, b) => a.percent - b.percent)[0]
    if (weakest && weakest.percent < 75) {
      return t('parentSuggestPractice')
        .replace('{subject}', t(weakest.subjectKey))
        .replace('{minutes}', '10')
    }
    if (pendingHw[0]) {
      return t('parentSuggestHomework')
        .replace('{subject}', pendingHw[0].subject)
        .replace('{task}', pendingHw[0].task || pendingHw[0].subject)
    }
    if (outstandingFees > 0) {
      return t('parentSuggestFee').replace('{item}', unpaid[0]?.name || t('billingOutstanding'))
    }
    return t('parentSuggestNone')
  })()

  const parentAlerts = notifications
    .filter((n) => n.unread && (n.role === 'parent' || n.role === 'all'))
    .slice(0, 2)

  return (
    <div className="space-y-5">
      <ChildSwitcher />
      {!linkedStudent ? (
        <p className="text-xs text-amber-200/90 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
          {t('noChildLinkedHint')}
        </p>
      ) : null}
      {!classLinked ? <InviteRedeemCard /> : null}

      <Card className="p-5 space-y-4 border-[var(--health-good)]/30">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5 text-[var(--health-good)]" aria-hidden />
          </div>
          <div>
            <Eyebrow>{t('parentPulseEyebrow')}</Eyebrow>
            <h2 className="text-lg font-extrabold text-white font-display mt-0.5">
              {doingWell
                ? t('parentChildDoingWell').replace('{name}', childName)
                : t('parentChildNeedsYou').replace('{name}', childName)}
            </h2>
          </div>
        </div>

        <ul className="space-y-2.5">
          <li className="flex items-center gap-2.5 text-xs">
            <ShieldCheck
              className={`h-4 w-4 shrink-0 ${attendedOk ? 'text-[var(--health-good)]' : 'text-[var(--health-warn)]'}`}
              aria-hidden
            />
            <span className="text-slate-200">
              {attendedOk ? t('parentCheckAttended') : t('parentCheckAttendanceWatch')}
            </span>
          </li>
          <li className="flex items-center gap-2.5 text-xs">
            <BookOpen
              className={`h-4 w-4 shrink-0 ${homeworkOk ? 'text-[var(--health-good)]' : 'text-[var(--health-warn)]'}`}
              aria-hidden
            />
            <span className="text-slate-200">
              {homeworkOk
                ? t('parentCheckHomeworkDone')
                : t('parentCheckHomeworkPending').replace('{count}', String(pendingHw.length))}
            </span>
          </li>
          <li className="flex items-center gap-2.5 text-xs">
            <MessageCircle className="h-4 w-4 shrink-0 text-[var(--accent2)]" aria-hidden />
            <span className="text-slate-200">{t('parentCheckEngaged')}</span>
          </li>
          <li className="flex items-center gap-2.5 text-xs">
            <Bus
              className={`h-4 w-4 shrink-0 ${busOk ? 'text-[var(--health-good)]' : 'text-slate-500'}`}
              aria-hidden
            />
            <span className="text-slate-200">
              {busReachedSchool
                ? t('parentCheckBusArrived')
                : busOk
                  ? t('parentCheckBusOk')
                  : t('parentCheckBusUnknown')}
            </span>
          </li>
        </ul>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t('parentSuggested')}
          </p>
          <p className="text-xs text-white font-semibold leading-relaxed">{suggestedAction}</p>
        </div>
      </Card>

      <Panel title={t('learningSummaryTitle')} subtitle={t('learningSummarySub')}>
        {learningSummary.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">{t('learningSummaryEmpty')}</p>
        ) : (
          <div className="space-y-2">
            {learningSummary.map((row) => (
              <div
                key={row.subject}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <p className="text-xs font-bold text-white">{row.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {row.understood ? t('conceptsUnderstood') : t('needsPractice')}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    row.understood
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-orange-500/15 text-orange-300'
                  }`}
                >
                  {row.understood ? t('onTrack') : t('practiceLabel')}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setActiveTab('academics')}
          className="mt-3 text-[11px] font-bold text-[var(--accent2)]"
        >
          {t('parentReportCard')} →
        </button>
      </Panel>

      {outstandingFees > 0 ? (
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className="w-full p-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--health-warn)]/30 bg-white/5 text-left"
        >
          <div>
            <p className="text-xs font-bold text-white">{t('parentFeeAction')}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {t('parentFeeCount').replace('{count}', String(unpaid.length))}
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 text-[var(--health-warn)]" aria-hidden />
        </button>
      ) : null}

      {parentAlerts.length > 0 ? (
        <Panel title={t('homeAlertsTitle')} subtitle={t('homeAlertsSub')}>
          {parentAlerts.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 mb-2 last:mb-0"
            >
              <p className="text-xs font-bold text-white">{n.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
            </button>
          ))}
        </Panel>
      ) : null}

      <button
        type="button"
        onClick={() => setActiveTab('scanner')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border border-violet-500/30"
        style={{ color: 'var(--ai-hint)' }}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        {t('parentAskCoach')}
      </button>
    </div>
  )
}
