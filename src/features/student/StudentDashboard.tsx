import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BookOpen,
  BrainCircuit,
  Bus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { currentDayCode, deriveTodayTimeline } from '../../lib/timetableApi'
import { Card, Eyebrow, Panel } from '../../components/ui/primitives'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'

const ATTENDANCE_GOAL = 90

function healthStatusKey(score: number): 'healthExcellent' | 'healthGood' | 'healthNeedsAttention' {
  if (score >= 85) return 'healthExcellent'
  if (score >= 70) return 'healthGood'
  return 'healthNeedsAttention'
}

function isDueToday(due: string): boolean {
  const d = due.trim().toLowerCase()
  if (!d) return false
  return d === 'today' || d.includes('due today') || d.startsWith('today')
}

function estimateBusEtaMinutes(busPosition: number, busReachedSchool: boolean): number | null {
  if (busReachedSchool) return null
  const remaining = Math.max(0, 88 - busPosition)
  if (remaining <= 0) return null
  return Math.max(1, Math.round(remaining / 2.4))
}

function presentStreak(records: { status: string }[]): number {
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]?.status === 'Present') streak += 1
    else break
  }
  return streak
}

/**
 * Student home answers: “What should I do today?”
 * Five cards only — action over raw ERP metrics.
 */
export function StudentDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const studyScore = useOrbitStore((s) => s.studyScore)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const tasks = useOrbitStore((s) => s.tasks)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const totalXp = useOrbitStore((s) => s.totalXp)
  const notifications = useOrbitStore((s) => s.notifications)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const fleet = useOrbitStore((s) => s.fleet)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)

  const t = (key: string) => translate(lang, key)
  const attendancePercent = getAttendancePercent()
  const pendingTasks = tasks.filter((task) => !task.completed)
  const dueTodayTasks = pendingTasks.filter((task) => isDueToday(task.due))
  const homeworkFocus = dueTodayTasks.length > 0 ? dueTodayTasks : pendingTasks

  const todayTimeline = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )
  const nextClasses = todayTimeline.filter((item) => item.status !== 'Completed').slice(0, 3)
  const nextLive = nextClasses[0]

  const activeBus = fleet.find((b) => b.active) ?? fleet[0]
  const busEta =
    activeBus && activeBus.active ? estimateBusEtaMinutes(busPosition, busReachedSchool) : null

  const streak = presentStreak(attendanceRecords)
  const academicStatus = healthStatusKey(studyScore)
  const academicAccent =
    academicStatus === 'healthExcellent'
      ? 'var(--health-good)'
      : academicStatus === 'healthNeedsAttention'
        ? 'var(--health-warn)'
        : 'var(--accent2)'

  const daysToGoal = useMemo(() => {
    if (attendancePercent >= ATTENDANCE_GOAL) return 0
    const need = ATTENDANCE_GOAL - attendancePercent
    return Math.max(1, Math.ceil(need / 2))
  }, [attendancePercent])

  const [missionChecked, setMissionChecked] = useState<Record<string, boolean>>({})

  const missionLines = useMemo(() => {
    const lines: { id: string; label: string; done?: boolean }[] = []
    for (const hw of homeworkFocus.slice(0, 2)) {
      lines.push({ id: `hw-${hw.id}`, label: hw.task || hw.subject })
    }
    if (nextLive) {
      lines.push({
        id: 'class',
        label: t('missionClassSoon').replace('{subject}', nextLive.name).replace('{time}', nextLive.time),
      })
    }
    if (busEta != null) {
      lines.push({
        id: 'bus',
        label: t('busArrivesIn').replace('{min}', String(busEta)),
      })
    }
    if (lines.length < 2 && streak > 0) {
      lines.push({ id: 'streak', label: t('missionKeepStreak').replace('{days}', String(streak)) })
    }
    return lines.slice(0, 4)
  }, [homeworkFocus, nextLive, busEta, streak, lang])

  const studyMinutes = Math.max(15, pendingTasks.length * 15 + (nextClasses.length > 0 ? 15 : 0))
  const aiNudge = nextLive
    ? t('studyNudgeRevision').replace('{subject}', nextLive.name)
    : homeworkFocus[0]
      ? t('aiCoachHomework').replace('{subject}', homeworkFocus[0].subject)
      : t('aiCoachDefault')

  const importantAlerts = notifications
    .filter((n) => n.unread && (n.role === 'student' || n.role === 'all'))
    .slice(0, 3)

  const progressBadges = unlockedBadges.slice(0, 4)

  return (
    <div className="space-y-5">
      {!classLinked ? <InviteRedeemCard /> : null}

      {/* 0 / Today's Focus — personal, motivating */}
      <Card className="p-5 space-y-3 border-[var(--accent)]/25">
        <Eyebrow>{t('todaysFocusEyebrow')}</Eyebrow>
        <h2 className="text-lg font-extrabold text-white font-display">{t('todaysFocus')}</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t('todaysFocusSummary')
            .replace('{classes}', String(todayTimeline.length || nextClasses.length))
            .replace('{assignments}', String(pendingTasks.length))
            .replace('{minutes}', String(studyMinutes))}
        </p>
        <p className="text-xs font-bold text-[var(--health-good)]">{t('todaysFocusEncourage')}</p>
      </Card>

      {/* 1. Today's Journey / Mission */}
      <Card className="p-5 space-y-4 border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>{t('todaysJourneyEyebrow')}</Eyebrow>
            <h2 className="text-base font-extrabold text-white font-display mt-1">{t('todaysMission')}</h2>
          </div>
          <TargetIcon />
        </div>
        <div className="space-y-2">
          {missionLines.length === 0 ? (
            <p className="text-xs text-slate-400">{t('todaysMissionClear')}</p>
          ) : (
            missionLines.map((item) => {
              const checked = Boolean(missionChecked[item.id])
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setMissionChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left"
                >
                  {checked ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--health-good)] shrink-0" aria-hidden />
                  ) : item.id.startsWith('hw') ? (
                    <BookOpen className="h-4 w-4 text-[var(--health-warn)] shrink-0" aria-hidden />
                  ) : item.id === 'bus' ? (
                    <Bus className="h-4 w-4 text-[var(--accent2)] shrink-0" aria-hidden />
                  ) : item.id === 'class' ? (
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-500 shrink-0" aria-hidden />
                  )}
                  <span
                    className={`text-xs font-bold ${checked ? 'text-slate-500 line-through' : 'text-white'}`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })
          )}
        </div>
        {pendingTasks.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className="text-[11px] font-bold text-[var(--health-warn)]"
          >
            {t('viewHomework')} →
          </button>
        ) : null}
      </Card>

      {/* 2. Academic Health — trend framing; attendance as input not hero */}
      <Card className="p-5 space-y-3" onClick={() => setActiveTab('academics')}>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>{t('academicHealth')}</Eyebrow>
          <span className="text-[10px] font-bold" style={{ color: academicAccent }}>
            {t(academicStatus)}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <p className="text-4xl font-black text-white" style={{ color: academicAccent }}>
            {studyScore}
          </p>
          <p className="text-xs font-bold text-[var(--health-good)] pb-1.5">{t('healthImproving')}</p>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {attendancePercent >= ATTENDANCE_GOAL
            ? t('attendanceGoalMet').replace('{pct}', String(attendancePercent))
            : t('attendanceActionable')
                .replace('{days}', String(daysToGoal))
                .replace('{goal}', String(ATTENDANCE_GOAL))
                .replace('{pct}', String(attendancePercent))}
        </p>
      </Card>

      {/* 3. AI Coach — proactive, not chatbot CTA */}
      <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-violet-500/30">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
            <BrainCircuit className="h-5 w-5 text-[var(--ai-hint)]" aria-hidden />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t('aiCoachEyebrow')}</Eyebrow>
            <h3 className="text-sm font-bold text-white mt-0.5">{t('aiCoachTitle')}</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{aiNudge}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('study-assistant')}
          className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0"
        >
          {t('aiCoachCta')}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </Card>

      {/* 4. Progress — identity / streaks */}
      <Panel title={t('progressTitle')} subtitle={t('progressSub')}>
        <div className="flex flex-wrap gap-2 mb-3">
          {streak >= 3 ? (
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              {t('badgeAttendanceStreak').replace('{days}', String(streak))}
            </span>
          ) : null}
          {tasks.length > 0 && pendingTasks.length === 0 ? (
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              {t('badgeHomeworkHero')}
            </span>
          ) : null}
          {progressBadges.map((name) => (
            <span
              key={name}
              className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10"
            >
              {name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Trophy className="h-4 w-4 text-[var(--health-good)]" aria-hidden />
          {t('xpTotal').replace('{xp}', String(totalXp))}
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className="mt-3 text-[11px] font-bold text-[var(--accent2)]"
        >
          {t('studentAchievements')} →
        </button>
      </Panel>

      {/* 5. Alerts — only important */}
      <Panel title={t('homeAlertsTitle')} subtitle={t('homeAlertsSub')}>
        {importantAlerts.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">{t('homeAlertsClear')}</p>
        ) : (
          <div className="space-y-2">
            {importantAlerts.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setActiveTab('alerts')}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left"
              >
                <Bell className="h-4 w-4 text-[var(--health-warn)] shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <button
        type="button"
        onClick={() => setActiveTab('scanner')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold border border-violet-500/35"
        style={{
          background: 'color-mix(in srgb, var(--ai-hint) 14%, transparent)',
          color: 'var(--ai-hint)',
        }}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        {t('scannerTitle')}
      </button>
    </div>
  )
}

function TargetIcon() {
  return (
    <div className="h-10 w-10 rounded-xl accent-soft flex items-center justify-center shrink-0">
      <CheckCircle2 className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
    </div>
  )
}
