import { AlertTriangle, ArrowRight, BrainCircuit, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../auth/authStore'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { STUDENT_NAME, subjectSyllabusDatabase, todayTimeline } from '../../data/demo'
import { Card, Eyebrow, Panel, ProgressBar, StatTile } from '../../components/ui/primitives'
import { EmptyState } from '../../components/ui/EmptyState'
import { LifecycleChart } from '../shared/LifecycleChart'

const FOCUS_SUBJECTS = ['chemLabSubject', 'mathSubject', 'scienceSubject'] as const

export function StudentDashboard() {
  const lang = useOrbitStore((s) => s.lang)
  const classLinked = useOrbitStore((s) => s.classLinked)
  const studyScore = useOrbitStore((s) => s.studyScore)
  const attendanceRecords = useOrbitStore((s) => s.attendanceRecords)
  const getAttendancePercent = useOrbitStore((s) => s.getAttendancePercent)
  const tasks = useOrbitStore((s) => s.tasks)
  const toggleTask = useOrbitStore((s) => s.toggleTask)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)
  const session = useAuthStore((s) => s.session)

  const t = (key: string) => translate(lang, key)
  const firstName = (session?.displayName || STUDENT_NAME).split(' ')[0]
  const attendancePercent = getAttendancePercent()
  const pendingTasks = tasks.filter((task) => !task.completed)
  const homeworkPercent = tasks.length
    ? Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100)
    : 100
  const lastFive = attendanceRecords.slice(-5)

  const focusAreas = FOCUS_SUBJECTS.flatMap((key) => subjectSyllabusDatabase[key] ?? [])
    .filter((topic) => topic.strength === 'Needs Practice')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white font-display">
            {t('goodMorning')}, {firstName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t('studentSub')}</p>
        </div>
        {classLinked ? (
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('scannerTitle')}
          </button>
        ) : null}
      </div>

      {!classLinked ? (
        <EmptyState title={t('noClassLinkedTitle')} description={t('noClassLinkedDesc')} />
      ) : null}

      <div className="grid sm:grid-cols-3 gap-4">
        <StatTile label={t('academicScore')} value={String(studyScore)} hint={t('basedOn')} accent="var(--accent2)" />
        <StatTile
          label={t('studentAttendance')}
          value={`${attendancePercent}%`}
          hint={`${attendanceRecords.length} school days tracked`}
        />
        <StatTile
          label={t('homeworkCompletion')}
          value={`${homeworkPercent}%`}
          hint={`${pendingTasks.length} ${t('pendingTasks').toLowerCase()}`}
        />
      </div>

      <Card className="p-5 space-y-3">
        <Eyebrow>{t('studentAttendance')} · Last 5 Days</Eyebrow>
        <div className="grid grid-cols-5 gap-2">
          {lastFive.map((record) => (
            <div
              key={record.date}
              className={`rounded-xl border p-3 text-center ${
                record.status === 'Present'
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-rose-500/10 border-rose-500/25'
              }`}
            >
              <p className="text-[9px] font-bold text-slate-400 uppercase">{record.day}</p>
              <p className="text-[10px] font-bold text-white mt-1">{record.date}</p>
              {record.status === 'Present' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mt-1.5" aria-hidden />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-400 mx-auto mt-1.5" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t('pendingTasks')} subtitle={t('taskDesc')}>
          <div className="space-y-2.5">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">All homework complete — great job!</p>
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
                    className="shrink-0 text-slate-500 hover:text-emerald-400 transition"
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
            {todayTimeline.map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
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
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <LifecycleChart />

      <Panel title={t('focusAreas')} subtitle="Concepts flagged as needing more practice.">
        <div className="grid sm:grid-cols-3 gap-4">
          {focusAreas.map((topic) => (
            <Card key={topic.name} className="p-4 space-y-2">
              <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 inline-block">
                {t('needsPolish')}
              </span>
              <h4 className="text-xs font-bold text-white">{topic.name}</h4>
              <ProgressBar value={topic.scoring} />
              <p className="text-[10px] text-slate-400 leading-relaxed">{topic.mistakeText}</p>
            </Card>
          ))}
        </div>
      </Panel>

      <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl accent-soft flex items-center justify-center shrink-0">
            <BrainCircuit className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t('askAi')}</h3>
            <p className="text-[11px] text-slate-400">{t('copilotDesc')}</p>
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
