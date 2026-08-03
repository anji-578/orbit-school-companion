import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Bot,
  Bus,
  Calendar,
  CalendarDays,
  Check,
  Flame,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { currentDayCode, deriveTodayTimeline } from '../../lib/timetableApi'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { SunViz } from './SunViz'

const ATTENDANCE_GOAL = 90
const XP_PER_LEVEL = 100

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

function healthLabelKey(score: number): 'healthExcellent' | 'healthGood' | 'healthNeedsAttention' {
  if (score >= 85) return 'healthExcellent'
  if (score >= 70) return 'healthGood'
  return 'healthNeedsAttention'
}

function minutesForTask(difficulty: string): number {
  if (difficulty === 'Hard') return 20
  if (difficulty === 'Easy') return 10
  return 15
}

function formatClockIn(mins: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() + mins)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/** Student home — actionable “what should I do today?” layout. */
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
  const calendarEvents = useOrbitStore((s) => s.calendarEvents)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const fleet = useOrbitStore((s) => s.fleet)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)

  const t = (key: string) => translate(lang, key)
  const attendancePercent = getAttendancePercent()
  const pendingTasks = tasks.filter((task) => !task.completed)
  const doneTasks = tasks.filter((task) => task.completed)
  const streak = presentStreak(attendanceRecords)

  const todayTimeline = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )
  const nextClasses = todayTimeline.filter((item) => item.status !== 'Completed')
  const nextLive = nextClasses[0]

  const activeBus = fleet.find((b) => b.active) ?? fleet[0]
  const busEta =
    activeBus && activeBus.active ? estimateBusEtaMinutes(busPosition, busReachedSchool) : null
  const classInMins = nextLive ? minutesUntilAmPm(nextLive.time) : null
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

  const studyMinutes = Math.max(
    15,
    pendingTasks.reduce((sum, task) => sum + minutesForTask(task.difficulty), 0),
  )

  const [missionChecked, setMissionChecked] = useState<Record<string, boolean>>({})

  const missionItems = useMemo(() => {
    const items: { id: string; title: string; mins?: number; done?: boolean }[] = []
    for (const hw of pendingTasks.slice(0, 3)) {
      items.push({
        id: `hw-${hw.id}`,
        title: hw.task || hw.subject,
        mins: minutesForTask(hw.difficulty),
      })
    }
    if (nextLive) {
      items.push({
        id: 'class',
        title: t('missionClassSoon').replace('{subject}', nextLive.name).replace('{time}', nextLive.time),
        mins: 5,
      })
    }
    if (items.length === 0) {
      items.push({ id: 'ready', title: t('missionReadySchool'), done: true })
    }
    return items.slice(0, 4)
  }, [pendingTasks, nextLive, lang])

  const aiSubject = nextLive?.name || pendingTasks[0]?.subject || t('scienceSubject')
  const aiNudge = nextLive
    ? t('aiSuggestRevision').replace('{subject}', nextLive.name).replace('{mins}', '20')
    : pendingTasks[0]
      ? t('aiSuggestHomework').replace('{subject}', pendingTasks[0].subject).replace('{mins}', '15')
      : t('aiSuggestDefault')

  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1)
  const xpIntoLevel = totalXp % XP_PER_LEVEL
  const xpToNext = XP_PER_LEVEL - xpIntoLevel

  const weekDays = useMemo(() => {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    // Map last 7 attendance records onto week strip (honest when history exists)
    const recent = attendanceRecords.slice(-7)
    return labels.map((label, i) => {
      const rec = recent[i]
      return {
        label,
        done: rec ? rec.status === 'Present' : i < Math.min(streak, 5),
      }
    })
  }, [attendanceRecords, streak])

  const healthKey = healthLabelKey(studyScore)
  const healthTone =
    healthKey === 'healthExcellent'
      ? 'var(--health-good)'
      : healthKey === 'healthNeedsAttention'
        ? 'var(--health-warn)'
        : '#38bdf8'

  const sparkPoints = useMemo(() => {
    const src =
      attendanceRecords.length >= 4
        ? attendanceRecords.slice(-8).map((r) => (r.status === 'Present' ? 1 : 0.35))
        : [0.45, 0.5, 0.55, 0.52, 0.6, 0.58, 0.65, Math.min(1, studyScore / 100)]
    const w = 120
    const h = 36
    return src
      .map((v, i) => {
        const x = (i / (src.length - 1)) * w
        const y = h - v * (h - 4) - 2
        return `${x},${y}`
      })
      .join(' ')
  }, [attendanceRecords, studyScore])

  const daysToGoal =
    attendancePercent >= ATTENDANCE_GOAL
      ? 0
      : Math.max(1, Math.ceil((ATTENDANCE_GOAL - attendancePercent) / 2))

  const upcoming = calendarEvents.slice(0, 3)
  const badges = unlockedBadges.slice(0, 3)

  return (
    <div className="space-y-4 pb-4">
      {!classLinked ? <InviteRedeemCard /> : null}

      {/* Today at a Glance */}
      <section className="orbit-glance relative overflow-hidden rounded-3xl border border-white/10 min-h-[220px]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[52%] opacity-70 sm:opacity-100">
          <SunViz className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,16,32,0.88) 0%, rgba(11,16,32,0.55) 55%, rgba(11,16,32,0.75) 100%)',
          }}
          aria-hidden
        />
        <div className="relative z-10 p-5 sm:p-6 lg:p-7 flex flex-col justify-center max-w-xl lg:max-w-[52%] gap-5">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-300/90">
              {t('todayAtGlance')}
            </p>
            <h2 className="text-2xl sm:text-[1.65rem] font-extrabold text-white font-display leading-tight">
              {t('glanceClasses').replace('{count}', String(todayTimeline.length || nextClasses.length))}
            </h2>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <GlanceStat
              icon={<Calendar className="h-4 w-4 text-sky-400" aria-hidden />}
              label={t('glanceNextClass')}
              value={nextLive?.name ?? t('glanceNoClass')}
              detail={nextLive ? classCountdown : undefined}
            />
            <GlanceStat
              icon={<Bus className="h-4 w-4 text-amber-300" aria-hidden />}
              label={t('glanceBusArrives')}
              value={
                busReachedSchool
                  ? t('glanceBusArrived')
                  : busEta != null
                    ? formatClockIn(busEta)
                    : t('glanceBusUnknown')
              }
              detail={
                busReachedSchool
                  ? undefined
                  : busEta != null
                    ? t('glanceInMinutes').replace('{min}', String(busEta))
                    : undefined
              }
            />
            <GlanceStat
              icon={<Zap className="h-4 w-4 text-violet-300" aria-hidden />}
              label={t('glanceStudyTime')}
              value={`${studyMinutes} min`}
              detail={t('glanceEstimated')}
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/25 bg-black/25 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 hover:border-white/40 transition"
          >
            {t('viewTodaysSchedule')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </section>

      {/* Mission + streak + AI */}
      <div className="grid lg:grid-cols-12 gap-4">
        <section className="lg:col-span-5 glass rounded-3xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-white font-display">{t('todaysMission')}</h3>
            <span className="text-[10px] font-bold text-slate-500">
              {missionItems.filter((m) => m.done || missionChecked[m.id]).length}/{missionItems.length}
            </span>
          </div>
          <ul className="space-y-2.5">
            {missionItems.map((item) => {
              const checked = Boolean(item.done || missionChecked[item.id])
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.done) return
                      if (item.id.startsWith('hw-')) {
                        setActiveTab('assignments')
                        return
                      }
                      setMissionChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-left hover:border-white/20 transition"
                  >
                    <span
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        checked
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-500'
                      }`}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-xs font-bold ${checked ? 'text-slate-500 line-through' : 'text-white'}`}
                      >
                        {item.title}
                      </span>
                      {item.mins != null && !checked ? (
                        <span className="text-[10px] text-slate-500">{item.mins} min</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          <section className="glass rounded-3xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400" aria-hidden />
              <h3 className="text-sm font-extrabold text-white font-display">{t('streakTitle')}</h3>
            </div>
            <p className="text-3xl font-black text-white">
              {streak} <span className="text-sm font-bold text-slate-400">{t('streakDays')}</span>
            </p>
            <div className="flex justify-between gap-1">
              {weekDays.map((d, i) => (
                <div key={`${d.label}-${i}`} className="flex flex-col items-center gap-1.5">
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                      d.done
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                  >
                    {d.done ? <Check className="h-3 w-3" aria-hidden /> : d.label}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold">{d.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-violet-500/35 bg-violet-500/10 p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/25 border border-violet-400/30 flex items-center justify-center shrink-0">
                <Bot className="h-6 w-6 text-violet-200" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-200/80">
                  {t('aiCoachEyebrow')}
                </p>
                <p className="text-xs text-slate-200 leading-relaxed mt-1">{aiNudge}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('study-assistant')}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}
            >
              {t('aiStartRevision').replace('{mins}', '20').replace('{subject}', aiSubject)}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </section>
        </div>
      </div>

      {/* Analytics row */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-white">{t('learningHealth')}</h3>
          <div className="flex items-end gap-3">
            <SemiGauge value={studyScore} color={healthTone} />
            <div className="pb-1 min-w-0">
              <p className="text-2xl font-black text-white">{studyScore}%</p>
              <p className="text-[10px] font-bold" style={{ color: healthTone }}>
                {t(healthKey)}
              </p>
            </div>
          </div>
          <svg viewBox="0 0 120 36" className="w-full h-9" aria-hidden>
            <polyline
              fill="none"
              stroke={healthTone}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={sparkPoints}
              opacity="0.85"
            />
          </svg>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            {attendancePercent >= ATTENDANCE_GOAL
              ? t('attendanceGoalMet').replace('{pct}', String(attendancePercent))
              : t('attendanceActionable')
                  .replace('{days}', String(daysToGoal))
                  .replace('{goal}', String(ATTENDANCE_GOAL))
                  .replace('{pct}', String(attendancePercent))}
          </p>
        </section>

        <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-white">{t('homeworkTitle')}</h3>
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className="text-[10px] font-bold text-violet-300"
            >
              {t('viewHomework')}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Donut
              done={doneTasks.length}
              total={Math.max(tasks.length, 1)}
              label={`${doneTasks.length}/${tasks.length || 0}`}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[10px] font-bold text-slate-400">
                {t('homeworkPendingCount').replace('{count}', String(pendingTasks.length))}
              </p>
              {pendingTasks.slice(0, 2).map((hw) => (
                <div key={hw.id} className="text-[11px]">
                  <p className="font-bold text-white truncate">{hw.subject}</p>
                  <p className="text-slate-500 truncate">{hw.due}</p>
                </div>
              ))}
              {pendingTasks.length === 0 ? (
                <p className="text-[11px] text-emerald-300 font-semibold">{t('homeworkAllDone')}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-white">{t('recentAchievements')}</h3>
          <ul className="space-y-2.5">
            {badges.length === 0 ? (
              <p className="text-[11px] text-slate-500">{t('noAchievementsYet')}</p>
            ) : (
              badges.map((name, i) => (
                <li key={name} className="flex items-center gap-2.5">
                  <span
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      i === 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    <Star className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-xs font-bold text-white truncate">{name}</span>
                </li>
              ))
            )}
            {streak >= 3 ? (
              <li className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-300">
                  <Trophy className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {t('badgeAttendanceStreak').replace('{days}', String(streak))}
                </span>
              </li>
            ) : null}
          </ul>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('studentAchievements')} →
          </button>
        </section>

        <section className="glass rounded-3xl border border-white/10 p-5 space-y-3">
          <h3 className="text-xs font-extrabold text-white">{t('upcomingTitle')}</h3>
          <ul className="space-y-2.5">
            {upcoming.length === 0 ? (
              <p className="text-[11px] text-slate-500">{t('upcomingEmpty')}</p>
            ) : (
              upcoming.map((ev) => (
                <li key={ev.id} className="flex items-start gap-2.5">
                  <CalendarDays className="h-4 w-4 text-violet-300 shrink-0 mt-0.5" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {ev.date} · {ev.category}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="text-[10px] font-bold text-[var(--accent2)]"
          >
            {t('sharedCalendarTitle')} →
          </button>
        </section>
      </div>

      {/* Quote + XP */}
      <div className="grid lg:grid-cols-12 gap-4">
        <section className="lg:col-span-8 glass rounded-3xl border border-white/10 p-5 flex gap-4 items-center overflow-hidden">
          <div
            className="hidden sm:block w-28 h-24 rounded-2xl bg-cover bg-center shrink-0 border border-white/10"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=240&auto=format&fit=crop&q=70)',
            }}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              {t('motivationEyebrow')}
            </p>
            <p className="text-sm font-semibold text-white leading-relaxed">{t('motivationQuote')}</p>
            <p className="text-[11px] text-slate-400 mt-1.5">{t('motivationCredit')}</p>
          </div>
        </section>

        <section className="lg:col-span-4 glass rounded-3xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
            <h3 className="text-xs font-extrabold text-white">{t('xpCardTitle')}</h3>
          </div>
          <p className="text-2xl font-black text-white">
            {totalXp} <span className="text-sm font-bold text-slate-400">XP</span>
          </p>
          <p className="text-[11px] text-slate-400">
            {t('xpLevelLine').replace('{level}', String(level)).replace('{xp}', String(xpToNext))}
          </p>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
              style={{ width: `${(xpIntoLevel / XP_PER_LEVEL) * 100}%` }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

function GlanceStat({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode
  label: string
  value: string
  detail?: string | null
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-[7.5rem]">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400">{label}</p>
        <p className="text-sm font-extrabold text-white leading-snug truncate">{value}</p>
        {detail ? <p className="text-[11px] text-slate-400 mt-0.5">{detail}</p> : null}
      </div>
    </div>
  )
}

function SemiGauge({ value, color }: { value: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  const r = 36
  const c = 2 * Math.PI * r
  const half = c / 2
  const dash = (clamped / 100) * half
  return (
    <svg width="88" height="52" viewBox="0 0 88 52" aria-hidden>
      <path
        d="M 8 48 A 36 36 0 0 1 80 48"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 8 48 A 36 36 0 0 1 80 48"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${half}`}
      />
    </svg>
  )
}

function Donut({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total ? done / total : 0
  const r = 28
  const c = 2 * Math.PI * r
  const dash = pct * c
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white">
        {label}
      </span>
    </div>
  )
}
