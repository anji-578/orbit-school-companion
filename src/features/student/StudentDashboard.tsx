import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Bus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Target,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { currentDayCode, deriveTodayTimeline } from '../../lib/timetableApi'
import { subjectSyllabusDatabase } from '../../data/demo'
import { Card, Eyebrow, Panel, ProgressBar, StatTile } from '../../components/ui/primitives'
import { InviteRedeemCard } from '../../components/ui/InviteRedeemCard'
import { LifecycleChart } from '../shared/LifecycleChart'

const FOCUS_SUBJECTS = ['chemLabSubject', 'mathSubject', 'scienceSubject'] as const
const ATTENDANCE_GOAL = 90

function healthStatusKey(score: number): 'healthExcellent' | 'healthGood' | 'healthNeedsAttention' {
  if (score >= 85) return 'healthExcellent'
  if (score >= 70) return 'healthGood'
  return 'healthNeedsAttention'
}

function attendanceStatusKey(pct: number): 'healthExcellent' | 'healthGood' | 'healthNeedsAttention' {
  if (pct >= 90) return 'healthExcellent'
  if (pct >= 80) return 'healthGood'
  return 'healthNeedsAttention'
}

function isDueToday(due: string): boolean {
  const d = due.trim().toLowerCase()
  if (!d) return false
  return d === 'today' || d.includes('due today') || d.startsWith('today')
}

/** Rough ETA from animated route progress — only when bus is actively en route. */
function estimateBusEtaMinutes(busPosition: number, busReachedSchool: boolean): number | null {
  if (busReachedSchool) return null
  const remaining = Math.max(0, 88 - busPosition)
  if (remaining <= 0) return null
  return Math.max(1, Math.round(remaining / 2.4))
}

export function StudentDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const studyScore = useOrbitStore((s) => s.studyScore)
  const timetableByDay = useOrbitStore((s) => s.timetableByDay)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const tasks = useOrbitStore((s) => s.tasks)
  const toggleTask = useOrbitStore((s) => s.toggleTask)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const fleet = useOrbitStore((s) => s.fleet)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const curriculum = useOrbitStore((s) => s.curriculum)

  const t = (key: string) => translate(lang, key)
  const attendancePercent = getAttendancePercent()
  const pendingTasks = tasks.filter((task) => !task.completed)
  const dueTodayTasks = pendingTasks.filter((task) => isDueToday(task.due))
  const homeworkFocus = dueTodayTasks.length > 0 ? dueTodayTasks : pendingTasks
  const homeworkPercent = tasks.length
    ? Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100)
    : 100
  const homeworkSubjects = [...new Set(homeworkFocus.map((task) => task.subject))].slice(0, 4)

  const todayTimeline = useMemo(
    () => deriveTodayTimeline(timetableByDay[currentDayCode()]),
    [timetableByDay],
  )
  const nextClasses = todayTimeline.filter((item) => item.status !== 'Completed').slice(0, 3)

  const activeBus = fleet.find((b) => b.active) ?? fleet[0]
  const busEta =
    activeBus && activeBus.active ? estimateBusEtaMinutes(busPosition, busReachedSchool) : null

  const focusAreas = FOCUS_SUBJECTS.flatMap((key) => subjectSyllabusDatabase[key] ?? [])
    .filter((topic) => topic.strength === 'Needs Practice')
    .slice(0, 3)

  const syllabusPending = curriculum.some((ch) => ch.subtopics.some((st) => !st.done))
  const academicStatus = healthStatusKey(studyScore)
  const attendanceStatus = attendanceStatusKey(attendancePercent)
  const academicAccent =
    academicStatus === 'healthExcellent'
      ? 'var(--health-good)'
      : academicStatus === 'healthNeedsAttention'
        ? 'var(--health-warn)'
        : 'var(--accent2)'
  const attendanceAccent =
    attendanceStatus === 'healthExcellent'
      ? 'var(--health-good)'
      : attendanceStatus === 'healthNeedsAttention'
        ? 'var(--health-warn)'
        : 'var(--accent2)'

  const missionItems = useMemo(() => {
    const items: { id: string; label: string }[] = []
    if (nextClasses.length > 0) {
      items.push({ id: 'attend', label: t('missionAttendClasses') })
    }
    if (pendingTasks.length > 0) {
      items.push({
        id: 'homework',
        label:
          dueTodayTasks.length > 0
            ? t('missionHomeworkToday').replace('{count}', String(dueTodayTasks.length))
            : t('missionHomeworkPending').replace('{count}', String(pendingTasks.length)),
      })
    }
    if (syllabusPending || focusAreas.length > 0) {
      items.push({ id: 'revise', label: t('missionRevise') })
    }
    if (classLinked) {
      items.push({ id: 'scan', label: t('missionPaperScan') })
    }
    return items.slice(0, 4)
  }, [
    nextClasses.length,
    pendingTasks.length,
    dueTodayTasks.length,
    syllabusPending,
    focusAreas.length,
    classLinked,
    lang,
  ])

  const [missionChecked, setMissionChecked] = useState<Record<string, boolean>>({})

  const nextSubjectForAi = nextClasses[0]?.name
  const aiNudge =
    nextSubjectForAi
      ? t('studyNudgeRevision').replace('{subject}', nextSubjectForAi)
      : t('copilotDesc')

  const homeworkHeadline =
    homeworkFocus.length === 0
      ? t('homeworkAllDone')
      : dueTodayTasks.length > 0
        ? t('homeworkDueTodayCount').replace('{count}', String(dueTodayTasks.length))
        : t('homeworkPendingCount').replace('{count}', String(pendingTasks.length))

  return (
    <div className="space-y-6">
      {classLinked ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-[color-mix(in_srgb,var(--ai-hint)_35%,transparent)]"
            style={{
              background: 'color-mix(in srgb, var(--ai-hint) 16%, transparent)',
              color: 'var(--ai-hint)',
            }}
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('scannerTitle')}
          </button>
        </div>
      ) : null}

      {!classLinked ? <InviteRedeemCard /> : null}

      {/* Primary: Today's Journey */}
      <Card className="p-5 sm:p-6 space-y-4 border-[var(--accent)]/20">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Eyebrow>{t('todaysJourneyEyebrow')}</Eyebrow>
            <h2 className="text-lg font-extrabold text-white font-display mt-1">{t('todaysJourney')}</h2>
            <p className="text-xs text-slate-400 mt-1">{t('todaysJourneySub')}</p>
          </div>
          <div className="h-10 w-10 rounded-xl accent-soft flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              {t('nextClasses')}
            </p>
            {nextClasses.length === 0 ? (
              <p className="text-xs text-slate-400">{t('timetableEmpty')}</p>
            ) : (
              <div className="space-y-2">
                {nextClasses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <Clock className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${
                        item.status === 'Live'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                          : 'bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[color-mix(in_srgb,var(--health-warn)_10%,transparent)] border border-[color-mix(in_srgb,var(--health-warn)_25%,transparent)]">
            <BookOpen className="h-4 w-4 text-[var(--health-warn)] shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">{homeworkHeadline}</p>
              {homeworkSubjects.length > 0 ? (
                <p className="text-[10px] text-slate-400 mt-0.5">{homeworkSubjects.join(' · ')}</p>
              ) : null}
            </div>
            {pendingTasks.length > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className="text-[10px] font-bold text-[var(--health-warn)] shrink-0"
              >
                {t('viewHomework')}
              </button>
            ) : null}
          </div>

          {busEta != null ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
              <Bus className="h-4 w-4 text-[var(--accent2)] shrink-0" aria-hidden />
              <p className="text-xs font-bold text-white">
                {t('busArrivesIn').replace('{min}', String(busEta))}
              </p>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Health / Attendance / Homework — secondary, not stressful hero */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile
          label={t('academicHealth')}
          value={String(studyScore)}
          hint={t(academicStatus)}
          accent={academicAccent}
          onClick={() => setActiveTab('academics')}
        />
        <StatTile
          label={t('studentAttendance')}
          value={`${attendancePercent}%`}
          hint={`${t(attendanceStatus)} · ${t('attendanceGoal').replace('{goal}', String(ATTENDANCE_GOAL))}`}
          accent={attendanceAccent}
          onClick={() => setActiveTab('attendance')}
        />
        <Card
          className="p-5 min-h-[125px] flex flex-col justify-between"
          onClick={() => setActiveTab('assignments')}
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t('studentAssignments')}
          </span>
          <div>
            <p className="text-lg font-black text-white" style={{ color: 'var(--health-warn)' }}>
              {homeworkHeadline}
            </p>
            {homeworkSubjects.length > 0 ? (
              <p className="text-[10px] text-slate-300 mt-1">{homeworkSubjects.join(', ')}</p>
            ) : null}
            <p className="text-[10px] text-slate-400 mt-1">
              {t('homeworkCompletion')}: {homeworkPercent}%
            </p>
          </div>
        </Card>
      </div>

      {missionItems.length > 0 ? (
        <Panel title={t('todaysMission')} subtitle={t('todaysMissionSub')}>
          <div className="space-y-2">
            {missionItems.map((item) => {
              const checked = Boolean(missionChecked[item.id])
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setMissionChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition"
                >
                  {checked ? (
                    <CheckCircle2 className="h-5 w-5 text-[var(--health-good)] shrink-0" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-500 shrink-0" aria-hidden />
                  )}
                  <span
                    className={`text-xs font-bold ${checked ? 'text-slate-400 line-through' : 'text-white'}`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </Panel>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t('pendingTasks')} subtitle={t('taskDesc')}>
          <div className="space-y-2.5">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">{t('homeworkAllDone')}</p>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <button
                    type="button"
                    aria-label={`Mark ${task.task} complete`}
                    onClick={() => toggleTask(task.id)}
                    className="shrink-0 text-slate-500 hover:text-[var(--health-good)] transition"
                  >
                    <Circle className="h-5 w-5" aria-hidden />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{task.task}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {task.subject} · {task.due}
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full accent-soft text-[var(--accent2)] shrink-0">
                    +{task.xp} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title={t('todaysSchedule')}>
          <div className="space-y-2.5">
            {todayTimeline.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">{t('timetableEmpty')}</p>
            ) : (
              todayTimeline.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <Clock className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.time} · {item.room}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-full shrink-0 ${
                      item.status === 'Live'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                        : item.status === 'Completed'
                          ? 'bg-[color-mix(in_srgb,var(--health-good)_15%,transparent)] text-[var(--health-good)] border border-[color-mix(in_srgb,var(--health-good)_25%,transparent)]'
                          : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <LifecycleChart />

      <Panel title={t('focusAreas')} subtitle={t('focusAreasSub')}>
        <div className="grid sm:grid-cols-3 gap-4">
          {focusAreas.map((topic) => (
            <Card key={topic.name} className="p-4 space-y-2">
              <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-[color-mix(in_srgb,var(--health-warn)_15%,transparent)] text-[var(--health-warn)] border border-[color-mix(in_srgb,var(--health-warn)_25%,transparent)] inline-block">
                {t('needsPolish')}
              </span>
              <h4 className="text-xs font-bold text-white">{topic.name}</h4>
              <ProgressBar value={topic.scoring} />
              <p className="text-[10px] text-slate-400 leading-relaxed">{topic.mistakeText}</p>
            </Card>
          ))}
        </div>
      </Panel>

      <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-[color-mix(in_srgb,var(--ai-hint)_30%,transparent)]">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--ai-hint) 18%, transparent)' }}
          >
            <BrainCircuit className="h-5 w-5" style={{ color: 'var(--ai-hint)' }} aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('askAi')}</h3>
            <p className="text-[11px] text-slate-400">{aiNudge}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('study-assistant')}
          className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0"
        >
          {t('studentStudyCopilot')}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </Card>
    </div>
  )
}
