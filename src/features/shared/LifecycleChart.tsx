import { useMemo } from 'react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { subjectProgressHistory } from '../../data/demo'
import { Card, Eyebrow } from '../../components/ui/primitives'
import type { LifecycleMetric } from '../../types'

const SUBJECT_KEYS = ['mathSubject', 'scienceSubject', 'chemLabSubject'] as const
const CLASS_SIZE = 42
const CHART_W = 420
const CHART_H = 128
const PAD_L = 26
const PAD_R = 10
const PAD_T = 14
const PAD_B = 22

function shortExamLabel(exam: string) {
  if (exam.startsWith('Unit')) return 'Unit'
  if (exam.startsWith('Quarter')) return 'Qtr'
  if (exam.startsWith('Half')) return 'Half'
  if (exam.startsWith('Pre')) return 'Pre'
  if (exam.startsWith('Final')) return 'Final'
  return exam.slice(0, 4)
}

export function LifecycleChart() {
  const lang = useOrbitStore((s) => s.lang)
  const selectedLifecycleSubject = useOrbitStore((s) => s.selectedLifecycleSubject)
  const selectedLifecycleMetric = useOrbitStore((s) => s.selectedLifecycleMetric)
  const setLifecycleSubject = useOrbitStore((s) => s.setLifecycleSubject)
  const setLifecycleMetric = useOrbitStore((s) => s.setLifecycleMetric)
  const t = (key: string) => translate(lang, key)

  const history = subjectProgressHistory[selectedLifecycleSubject] ?? subjectProgressHistory.chemLabSubject
  const isMarks = selectedLifecycleMetric === 'marks'

  const chart = useMemo(() => {
    const count = Math.min(history.exams.length, history.marks.length, history.ranks.length, history.classAvg.length)
    const exams = history.exams.slice(0, count)
    const own = (isMarks ? history.marks : history.ranks).slice(0, count)
    const compare = (isMarks ? history.classAvg : exams.map(() => CLASS_SIZE / 2)).slice(0, count)
    const maxVal = isMarks ? 50 : CLASS_SIZE
    const innerW = CHART_W - PAD_L - PAD_R
    const innerH = CHART_H - PAD_T - PAD_B
    const step = count <= 1 ? 0 : innerW / (count - 1)

    const toY = (val: number) => {
      const clamped = Math.max(0, Math.min(maxVal, val))
      const ratio = isMarks ? clamped / maxVal : 1 - clamped / maxVal
      return PAD_T + innerH - ratio * innerH
    }
    const toX = (idx: number) => PAD_L + step * idx

    const ownPoints = own.map((v, idx) => ({
      x: toX(idx),
      y: toY(v),
      v,
      label: shortExamLabel(exams[idx] ?? ''),
    }))
    const comparePoints = compare.map((v, idx) => ({ x: toX(idx), y: toY(v), v }))
    const toPath = (pts: { x: number; y: number }[]) =>
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

    const ownPath = toPath(ownPoints)
    const areaPath =
      ownPoints.length > 0
        ? `${ownPath} L${ownPoints[ownPoints.length - 1]!.x.toFixed(1)},${(PAD_T + innerH).toFixed(1)} L${ownPoints[0]!.x.toFixed(1)},${(PAD_T + innerH).toFixed(1)} Z`
        : ''

    const yTicks = isMarks
      ? [
          { v: 0, y: toY(0) },
          { v: 25, y: toY(25) },
          { v: 50, y: toY(50) },
        ]
      : [
          { v: CLASS_SIZE, y: toY(CLASS_SIZE) },
          { v: Math.round(CLASS_SIZE / 2), y: toY(CLASS_SIZE / 2) },
          { v: 1, y: toY(1) },
        ]

    return { ownPoints, comparePoints, ownPath, comparePath: toPath(comparePoints), areaPath, yTicks }
  }, [history, isMarks])

  const latestOwn = isMarks ? history.marks[history.marks.length - 1] : history.ranks[history.ranks.length - 1]
  const delta = isMarks
    ? history.marks[history.marks.length - 1] - history.marks[0]
    : history.ranks[0] - history.ranks[history.ranks.length - 1]
  const lastPoint = chart.ownPoints[chart.ownPoints.length - 1]

  return (
    <Card className="p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Eyebrow>{t('ananyaProgress')}</Eyebrow>
          <p className="text-sm font-bold text-white mt-0.5 truncate">
            {t(selectedLifecycleSubject)}
            <span className="text-slate-400 font-semibold"> · </span>
            <span className="text-[var(--accent2)]">{isMarks ? `${latestOwn}/50` : `#${latestOwn}`}</span>
          </p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            delta >= 0
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
          }`}
        >
          {delta >= 0 ? '+' : ''}
          {delta} {isMarks ? 'marks' : 'ranks'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex bg-white/5 border border-white/10 rounded-md p-0.5" role="tablist" aria-label="Subject">
          {SUBJECT_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selectedLifecycleSubject === key}
              onClick={() => setLifecycleSubject(key)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                selectedLifecycleSubject === key ? 'bg-[var(--accent)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-md p-0.5" role="tablist" aria-label="Metric">
          {(['marks', 'ranks'] as LifecycleMetric[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={selectedLifecycleMetric === m}
              onClick={() => setLifecycleMetric(m)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                selectedLifecycleMetric === m ? 'bg-[var(--accent)] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'marks' ? t('marks') : t('rank')}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-auto max-h-[140px]"
        role="img"
        aria-label="Lifecycle progress chart"
      >
        <defs>
          <linearGradient id="orbitLifecycleFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {chart.yTicks.map((tick) => (
          <g key={`y-${tick.v}`}>
            <line
              x1={PAD_L}
              x2={CHART_W - PAD_R}
              y1={tick.y}
              y2={tick.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text x={PAD_L - 6} y={tick.y + 2.5} fontSize={8} textAnchor="end" fill="#64748b">
              {tick.v}
            </text>
          </g>
        ))}

        {chart.areaPath ? <path d={chart.areaPath} fill="url(#orbitLifecycleFill)" /> : null}
        <path
          d={chart.comparePath}
          fill="none"
          stroke="#64748b"
          strokeWidth={1.25}
          strokeDasharray="3.5 3"
          strokeLinecap="round"
        />
        <path
          d={chart.ownPath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {chart.ownPoints.map((p, idx) => (
          <g key={`o-${idx}`}>
            <circle cx={p.x} cy={p.y} r={3} fill="var(--accent2)" stroke="#0b1020" strokeWidth={1.25} />
            <text x={p.x} y={CHART_H - 6} fontSize={8} textAnchor="middle" fill="#94a3b8">
              {p.label}
            </text>
          </g>
        ))}

        {lastPoint ? (
          <text
            x={lastPoint.x}
            y={Math.max(10, lastPoint.y - 7)}
            fontSize={9}
            textAnchor={chart.ownPoints.length > 1 && lastPoint.x > CHART_W * 0.75 ? 'end' : 'middle'}
            fill="#e2e8f0"
            fontWeight={700}
          >
            {isMarks ? lastPoint.v : `#${lastPoint.v}`}
          </text>
        ) : null}
      </svg>

      <div className="flex items-center gap-3 text-[9px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Ananya
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 border-t border-dashed border-slate-500" />
          {isMarks ? t('tableHeadAverage') : t('classMidpoint')}
        </span>
        <span className="ml-auto font-semibold text-slate-400">{t('trendText')}</span>
      </div>
    </Card>
  )
}
