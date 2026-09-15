import { useMemo } from 'react'
import {
  ArrowRight,
  Bus,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  Star,
  Trophy,
  AlertTriangle,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { currentDayCode, deriveTodayTimeline } from '../../lib/timetableApi'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { SunViz } from './SunViz'
import type { CalendarEvent, HomeworkTask, StudentGrade } from '../../types'

const ATTENDANCE_GOAL = 90
const XP_PER_LEVEL = 100

const GRADE_SUBJECTS: { field: 'math' | 'science' | 'chem'; subjectKey: string; feedbackKey: string }[] = [
  { field: 'math', subjectKey: 'mathSubject', feedbackKey: 'mathFeedback' },
  { field: 'science', subjectKey: 'scienceSubject', feedbackKey: 'scienceFeedback' },
  { field: 'chem', subjectKey: 'chemLabSubject', feedbackKey: 'chemFeedback' },
]

type PriorityKind = 'homework' | 'exam' | 'class' | 'caught_up'

type PriorityAction = {
  kind: PriorityKind
  title: string
  detail: string
  estimate?: string
  cta: string
  onCta: () => void
  orbitHint?: string
}

type AttentionItem = {
  id: string
  tone: 'warn' | 'info'
  label: string
  title: string
  body: string
}

type DayTask = {
  id: string
  title: string
  meta: string
  onOpen: () => void
}

function presentStreak(records: { status: string }[]): number {
  let streak = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i]?.status === 'Present') streak += 1
    else break
  }
  return streak
}

function estimateBusEtaMinutes(busPosition: number, busReachedSchool: boolean): number | null {
  if (busReachedSchool) return null
  const remaining = Math.max(0, 88 - busPosition)
  if (remaining <= 0) return null
  return Math.max(1, Math.round(remaining / 2.4))
}

function minutesUntilAmPm(label: string, now = new Date()): number | null {
  const m = label.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2])
  const ap = m[3].toUpperCase()
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  const target = new Date(now)
  target.setHours(h, min, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 60000)
}

function taskMinutes(task: HomeworkTask): number {
  if (task.estimatedMinutes != null) return task.estimatedMinutes
  if (task.difficulty === 'Hard') return 45
  if (task.difficulty === 'Easy') return 15
  return 25
}

function dueUrgency(due: string): number {
  const d = due.toLowerCase()
  if (d.includes('tomorrow') || d === 'tomorrow') return 0
  if (d.includes('today') || d.includes('due today')) return 0
  if (d.includes('2 day') || d.includes('due in 2')) return 1
  if (d.includes('completed')) return 9
  return 2
}

function parseEventDate(raw: string): Date | null {
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

function daysUntil(raw: string, now = new Date()): number | null {
  const d = parseEventDate(raw)
  if (!d) return null
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((target.getTime() - start.getTime()) / 86400000)
}

function categoryRank(category: CalendarEvent['category']): number {
  if (category === 'Exams') return 0
  if (category === 'Extracurricular') return 1
  if (category === 'PTA Meetings') return 2
  return 3
}

function progressLabelKey(score: number): 'healthExcellent' | 'healthGood' | 'healthNeedsAttention' {
  if (score >= 85) return 'healthExcellent'
  if (score >= 70) return 'healthGood'
  return 'healthNeedsAttention'
}

function parseScorePercent(raw: string): number {
  const [obtainedRaw, totalRaw] = raw.split('/')
  const obtained = Number(obtainedRaw) || 0
  const total = Number(totalRaw) || 50
  return Math.round((obtained / total) * 100)
}

function subjectSnapshots(grade: StudentGrade | undefined) {
  if (!grade) return []
  return GRADE_SUBJECTS.map((row) => ({
    ...row,
    percent: parseScorePercent(grade[row.field]),
  }))
}

/** Student home — companion hierarchy: Today → Priority → Tasks → Attention → Progress → Wins → Coming up → Discover. */
export function StudentDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const studyScore = useOrbitStore((s) => s.studyScore)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const tasks = useOrbitStore((s) => s.tasks)
  const studentGrades = useOrbitStore((s) => s.studentGrades)
  const unlockedBadges = useOrbitStore((s) => s.unlockedBadges)
  const totalXp = useOrbitStore((s) => s.totalXp)
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const competitions = useOrbitStore((s) => s.competitions)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const fleet = useOrbitStore((s) => s.fleet)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const startTask = useOrbitStore((s) => s.startTask)
  const toggleTask = useOrbitStore((s) => s.toggleTask)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const t = (key: string) => translate(lang, key)
  const attendancePercent = getAttendancePercent()
  const pendingTasks = useMemo(
    () =>
      [...tasks.filter((task) => !task.completed)].sort(
        (a, b) => dueUrgency(a.due) - dueUrgency(b.due) || taskMinutes(b) - taskMinutes(a),
      ),
    [tasks],
  )
  const doneCount = tasks.filter((task) => task.completed).length
  const streak = presentStreak(attendanceRecords)
  const gradeSubjects = useMemo(() => subjectSnapshots(studentGrades[0]), [studentGrades])

  const todayTimeline = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )
  const nextClasses = todayTimeline.filter((item) => item.status !== 'Completed')
  const nextLive = nextClasses[0]
  const classCount = todayTimeline.length || nextClasses.length

  const activeBus = fleet.find((b) => b.active) ?? fleet[0]
  const busRelevant = Boolean(activeBus?.active) && !busReachedSchool
  const busEta = busRelevant ? estimateBusEtaMinutes(busPosition, busReachedSchool) : null
  const classInMins = nextLive ? minutesUntilAmPm(nextLive.time) : null

  const studyMinutes = pendingTasks.reduce((sum, task) => sum + taskMinutes(task), 0)

  const urgentHomework = pendingTasks.find((task) => dueUrgency(task.due) === 0)
  const soonExam = useMemo(() => {
    return calendarEvents
      .filter((ev) => ev.category === 'Exams')
      .map((ev) => ({ ev, days: daysUntil(ev.date) }))
      .filter((row) => row.days != null && row.days >= 0 && row.days <= 3)
      .sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0]
  }, [calendarEvents])

  const priority = useMemo<PriorityAction>(() => {
    if (urgentHomework) {
      const mins = taskMinutes(urgentHomework)
      const status = urgentHomework.started
        ? t('homePriorityInProgress')
        : t('homePriorityNotStarted')
      return {
        kind: 'homework',
        title: `${urgentHomework.subject} · ${urgentHomework.task}`,
        detail: `${urgentHomework.due} · ${status}`,
        estimate: t('homePriorityEstimate').replace('{mins}', String(mins)),
        cta: urgentHomework.started ? t('homePriorityMarkDone') : t('homePriorityStartHw'),
        onCta: () => {
          if (!urgentHomework.started) {
            startTask(urgentHomework.id)
            triggerToast(t('homePriorityStartedToast'))
            setActiveTab('assignments')
            return
          }
          toggleTask(urgentHomework.id)
          triggerToast(t('homePriorityDoneToast'))
        },
        orbitHint: t('homePriorityOrbitHw').replace('{mins}', String(mins)),
      }
    }

    if (soonExam) {
      const days = soonExam.days ?? 0
      const when =
        days === 0
          ? t('homePriorityExamToday')
          : days === 1
            ? t('homePriorityExamTomorrow')
            : t('homePriorityExamIn').replace('{days}', String(days))
      return {
        kind: 'exam',
        title: soonExam.ev.title,
        detail: when,
        estimate: t('homePriorityExamHint'),
        cta: t('homePriorityStartRevision'),
        onCta: () => setActiveTab('study-assistant'),
        orbitHint: t('homePriorityOrbitExam'),
      }
    }

    if (nextLive && classInMins != null && classInMins >= 0 && classInMins <= 30) {
      return {
        kind: 'class',
        title: nextLive.name,
        detail: t('homePriorityClassSoon')
          .replace('{time}', nextLive.time)
          .replace('{mins}', String(classInMins)),
        estimate: t('homePriorityClassPrep'),
        cta: t('homePriorityPrepClass'),
        onCta: () => setActiveTab('study-assistant'),
        orbitHint: t('homePriorityOrbitClass')
          .replace('{mins}', '10')
          .replace('{subject}', nextLive.name),
      }
    }

    if (pendingTasks[0]) {
      const hw = pendingTasks[0]
      const mins = taskMinutes(hw)
      return {
        kind: 'homework',
        title: `${hw.subject} · ${hw.task}`,
        detail: `${hw.due} · ${hw.started ? t('homePriorityInProgress') : t('homePriorityNotStarted')}`,
        estimate: t('homePriorityEstimate').replace('{mins}', String(mins)),
        cta: hw.started ? t('homePriorityMarkDone') : t('homePriorityStartHw'),
        onCta: () => {
          if (!hw.started) {
            startTask(hw.id)
            setActiveTab('assignments')
            return
          }
          toggleTask(hw.id)
        },
        orbitHint: t('homePriorityOrbitHw').replace('{mins}', String(mins)),
      }
    }

    return {
      kind: 'caught_up',
      title: t('homePriorityCaughtUpTitle'),
      detail: t('homePriorityCaughtUpBody'),
      cta: t('homePriorityTryChallenge'),
      onCta: () => setActiveTab('competitions'),
      orbitHint: t('homePriorityOrbitExplore'),
    }
  }, [
    urgentHomework,
    soonExam,
    nextLive,
    classInMins,
    pendingTasks,
    lang,
    startTask,
    toggleTask,
    setActiveTab,
    triggerToast,
  ])

  const dayTasks = useMemo<DayTask[]>(() => {
    const items: DayTask[] = []
    for (const hw of pendingTasks.slice(0, 3)) {
      items.push({
        id: `hw-${hw.id}`,
        title: hw.task || hw.subject,
        meta: `${taskMinutes(hw)} min · ${hw.due}`,
        onOpen: () => setActiveTab('assignments'),
      })
    }
    if (nextLive && classInMins != null && classInMins > 0 && classInMins <= 90) {
      items.push({
        id: 'prep-class',
        title: t('homeTaskPrepClass').replace('{subject}', nextLive.name),
        meta: `10 min · ${nextLive.time}`,
        onOpen: () => setActiveTab('study-assistant'),
      })
    }
    return items.slice(0, 4)
  }, [pendingTasks, nextLive, classInMins, lang, setActiveTab])

  const attentionItems = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = []
    const daysToGoal =
      attendancePercent >= ATTENDANCE_GOAL
        ? 0
        : Math.max(1, Math.ceil((ATTENDANCE_GOAL - attendancePercent) / 2))

    if (attendancePercent < ATTENDANCE_GOAL) {
      items.push({
        id: 'attendance',
        tone: 'warn',
        label: t('studentAttendance'),
        title: `${attendancePercent}%`,
        body: t('attendanceActionable')
          .replace('{days}', String(daysToGoal))
          .replace('{goal}', String(ATTENDANCE_GOAL))
          .replace('{pct}', String(attendancePercent)),
      })
    }

    if (urgentHomework && !urgentHomework.started) {
      items.push({
        id: 'hw-urgent',
        tone: 'warn',
        label: urgentHomework.subject,
        title: t('homeAttentionHwTitle'),
        body: t('homeAttentionHwBody').replace('{due}', urgentHomework.due),
      })
    }

    const struggle = gradeSubjects.find((s) => s.percent < 75)
    if (struggle) {
      items.push({
        id: `grade-${struggle.field}`,
        tone: 'info',
        label: t(struggle.subjectKey),
        title: t('homeAttentionPracticeTitle'),
        body: t(struggle.feedbackKey),
      })
    }

    return items.slice(0, 3)
  }, [attendancePercent, urgentHomework, gradeSubjects, lang])

  const upcoming = useMemo(() => {
    return [...calendarEvents]
      .map((ev) => ({ ev, days: daysUntil(ev.date), rank: categoryRank(ev.category) }))
      .filter((row) => row.days == null || row.days >= 0)
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank
        return (a.days ?? 999) - (b.days ?? 999)
      })
      .slice(0, 3)
  }, [calendarEvents])

  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1)
  const xpToNext = XP_PER_LEVEL - (totalXp % XP_PER_LEVEL)
  const badges = unlockedBadges.slice(0, 3)
  const improving = gradeSubjects.filter((s) => s.percent >= 75).length
  const progressTone =
    studyScore >= 85 ? 'var(--health-good)' : studyScore < 70 ? 'var(--health-warn)' : '#38bdf8'
  const openCompetitions = competitions.length

  const classCountdown =
    classInMins == null
      ? nextLive?.time ?? null
      : classInMins > 0
        ? t('glanceInMinutes').replace('{min}', String(classInMins))
        : classInMins === 0
          ? t('glanceStartingNow')
          : nextLive?.status === 'Live'
            ? t('glanceLiveNow')
            : nextLive?.time ?? null

  return (
    <div className="space-y-4 pb-6">
      {!classLinked ? <InviteRedeemCard /> : null}

      <section className="orbit-glance relative overflow-hidden rounded-3xl border">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[48%] lg:w-[42%] opacity-90">
          <SunViz className="h-full w-full min-h-[160px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 sm:hidden orbit-glance-scrim" aria-hidden />
        <div className="relative z-10 p-5 sm:p-6 max-w-xl lg:max-w-[58%] space-y-4">
          <div>
            <p className="orbit-glance-eyebrow text-[10px] font-black uppercase tracking-[0.2em]">
              {t('homeTodayEyebrow')}
            </p>
            <p className="orbit-glance-title mt-1.5 text-lg sm:text-xl font-extrabold font-display leading-snug">
              {t('homeTodaySummary')
                .replace('{classes}', String(classCount))
                .replace('{tasks}', String(pendingTasks.length))
                .replace('{mins}', String(Math.max(studyMinutes, pendingTasks.length ? studyMinutes : 0)))}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <DayBlock
              label={t('glanceNextClass')}
              value={nextLive?.name ?? t('glanceNoClass')}
              detail={
                nextLive ? `${nextLive.time}${classCountdown ? ` · ${classCountdown}` : ''}` : undefined
              }
            />
            <DayBlock
              label={t('homeWorkloadLabel')}
              value={
                pendingTasks.length === 0
                  ? t('homeworkAllDone')
                  : t('homeWorkloadValue')
                      .replace('{count}', String(pendingTasks.length))
                      .replace('{mins}', String(studyMinutes || 15))
              }
              detail={pendingTasks.length ? t('glanceEstimated') : undefined}
            />
          </div>

          {busRelevant && busEta != null ? (
            <p className="orbit-glance-detail text-[11px] flex items-center gap-1.5">
              <Bus className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              {t('homeBusContext').replace('{mins}', String(busEta))}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className="orbit-glance-btn inline-flex w-fit items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition"
          >
            {t('viewTodaysSchedule')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </section>

      <section
        className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${
          priority.kind === 'caught_up'
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : 'border-[var(--accent)]/35 bg-[var(--accent)]/8'
        }`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {priority.kind === 'caught_up' ? t('homePriorityCaughtEyebrow') : t('homePriorityEyebrow')}
        </p>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white leading-tight">
            {priority.title}
          </h2>
          <p className="text-sm text-slate-300">{priority.detail}</p>
          {priority.estimate ? <p className="text-xs text-slate-500">{priority.estimate}</p> : null}
          {priority.orbitHint ? (
            <p className="text-xs text-[var(--accent2)]/90 pt-1">{priority.orbitHint}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={priority.onCta}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-black"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          {priority.cta}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </section>

      <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-white font-display">{t('homeTasksTitle')}</h3>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('homeTasksViewAll')} →
          </button>
        </div>
        {dayTasks.length === 0 ? (
          <p className="text-xs text-emerald-300/90 font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {t('homeTasksEmpty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {dayTasks.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onOpen}
                  className="w-full flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-left hover:border-white/20 transition"
                >
                  <Circle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-500">{item.meta}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-white font-display">{t('homeAttentionTitle')}</h3>
        {attentionItems.length === 0 ? (
          <p className="text-xs text-slate-400">{t('homeAttentionClear')}</p>
        ) : (
          <ul className="space-y-2.5">
            {attentionItems.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border p-3.5 ${
                  item.tone === 'warn'
                    ? 'border-amber-500/25 bg-amber-500/5'
                    : 'border-violet-500/25 bg-violet-500/5'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      item.tone === 'warn' ? 'text-amber-400' : 'text-violet-300'
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {item.label}
                    </p>
                    <p className="text-xs font-bold text-white mt-0.5">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {attentionItems.length > 0 ? (
          <button
            type="button"
            onClick={() =>
              setActiveTab(attendancePercent < ATTENDANCE_GOAL ? 'attendance' : 'academics')
            }
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('homeAttentionDetails')} →
          </button>
        ) : null}
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
          <h3 className="text-sm font-extrabold text-white font-display">{t('homeProgressTitle')}</h3>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black leading-none" style={{ color: progressTone }}>
              {studyScore}
            </p>
            <div className="pb-0.5">
              <p className="text-xs font-bold" style={{ color: progressTone }}>
                {t(progressLabelKey(studyScore))}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {improving > 0
                  ? t('homeProgressImproving').replace('{count}', String(improving))
                  : t('homeProgressSteady')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-400">
            <span>
              {t('studentAttendance')}: <strong className="text-white">{attendancePercent}%</strong>
            </span>
            <span>
              {t('homeworkTitle')}:{' '}
              <strong className="text-white">
                {doneCount}/{tasks.length || 0}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('academics')}
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('homeProgressView')} →
          </button>
        </section>

        <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
          <h3 className="text-sm font-extrabold text-white font-display">{t('homeWinsTitle')}</h3>
          <ul className="space-y-2">
            {streak > 0 ? (
              <li className="flex items-center gap-2.5 text-xs font-bold text-white">
                <Flame className="h-4 w-4 text-orange-400" aria-hidden />
                {t('badgeAttendanceStreak').replace('{days}', String(streak))}
              </li>
            ) : null}
            {badges.map((name) => (
              <li key={name} className="flex items-center gap-2.5 text-xs font-bold text-white">
                <Trophy className="h-4 w-4 text-amber-300" aria-hidden />
                {name}
              </li>
            ))}
            {streak === 0 && badges.length === 0 ? (
              <p className="text-[11px] text-slate-500">{t('noAchievementsYet')}</p>
            ) : null}
          </ul>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            {t('homeWinsXp')
              .replace('{xp}', String(totalXp))
              .replace('{level}', String(level))
              .replace('{next}', String(xpToNext))}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('studentAchievements')} →
          </button>
        </section>
      </div>

      <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-white font-display">{t('homeComingTitle')}</h3>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('sharedCalendarTitle')} →
          </button>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-[11px] text-slate-500">{t('upcomingEmpty')}</p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map(({ ev, days }) => (
              <li key={ev.id} className="flex items-start gap-2.5">
                <CalendarDays className="h-4 w-4 text-violet-300 shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {ev.date}
                    {days != null
                      ? ` · ${
                          days === 0
                            ? t('homeComingToday')
                            : t('homeComingIn').replace('{days}', String(days))
                        }`
                      : ` · ${ev.category}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-white font-display">{t('homeDiscoverTitle')}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('gk-quiz')}
            className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition space-y-1"
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t('homeDiscoverChallenge')}
            </p>
            <p className="text-xs font-bold text-white">{t('homeDiscoverChallengeBody')}</p>
            <p className="text-[10px] text-[var(--accent2)]">+40 XP</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('competitions')}
            className="text-left p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition space-y-1"
          >
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {t('homeDiscoverOpps')}
            </p>
            <p className="text-xs font-bold text-white">
              {t('homeDiscoverOppsBody').replace('{count}', String(openCompetitions))}
            </p>
            <p className="text-[10px] text-[var(--accent2)]">{t('homeDiscoverExplore')} →</p>
          </button>
        </div>
      </section>
    </div>
  )
}

function DayBlock({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string | null
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 px-3.5 py-3 min-w-0">
      <p className="orbit-glance-label text-[10px] font-bold">{label}</p>
      <p className="orbit-glance-value text-sm font-extrabold leading-snug mt-1 truncate">{value}</p>
      {detail ? <p className="orbit-glance-detail text-[11px] mt-0.5">{detail}</p> : null}
    </div>
  )
}
