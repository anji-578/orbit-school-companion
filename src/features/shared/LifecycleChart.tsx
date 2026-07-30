import { useMemo } from 'react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { subjectProgressHistory } from '../../data/demo'
import { Card, Eyebrow } from '../../components/ui/primitives'
import type { LifecycleMetric } from '../../types'

const SUBJECT_KEYS = ['mathSubject', 'scienceSubject', 'chemLabSubject'] as const
const CLASS_SIZE = 42
const CHART_W = 560
const CHART_H = 220
const PAD_L = 36
const PAD_R = 16
const PAD_T = 16
const PAD_B = 36

function shortExamLabel(exam: string) {
  if (exam.startsWith('Unit')) return 'Unit'
  if (exam.startsWith('Half')) return 'Half-Yearly'
  if (exam.startsWith('Pre')) return 'Pre-Board'
  if (exam.startsWith('Final')) return 'Final'
  return exam.split(' ')[0]
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

    const ownPoints = own.map((v, idx) => ({ x: toX(idx), y: toY(v), v, label: shortExamLabel(exams[idx] ?? '') }))
    const comparePoints = compare.map((v, idx) => ({ x: toX(idx), y: toY(v), v }))
    const toPath = (pts: { x: number; y: number }[]) =>
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

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

    return {
      exams,
      ownPoints,
      comparePoints,
      ownPath: toPath(ownPoints),
      comparePath: toPath(comparePoints),
      yTicks,
      plotBottom: PAD_T + innerH,
    }
  }, [history, isMarks])

  const latestOwn = isMarks ? history.marks[history.marks.length - 1] : history.ranks[history.ranks.length - 1]
  const delta = isMarks
    ? history.marks[history.marks.length - 1] - history.marks[0]
    : history.ranks[0] - history.ranks[history.ranks.length - 1]

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Eyebrow>{t('ananyaProgress')}</Eyebrow>
          <p className="text-lg font-black text-white mt-1">
            {t(selectedLifecycleSubject)} · {isMarks ? `${latestOwn}/50` : `#${latestOwn}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5" role="tablist" aria-label="Subject">
            {SUBJECT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selectedLifecycleSubject === key}
                onClick={() => setLifecycleSubject(key)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                  selectedLifecycleSubject === key ? 'bg-[var(--accent)] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5" role="tablist" aria-label="Metric">
            {(['marks', 'ranks'] as LifecycleMetric[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={selectedLifecycleMetric === m}
                onClick={() => setLifecycleMetric(m)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                  selectedLifecycleMetric === m ? 'bg-[var(--accent)] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {m === 'marks' ? t('marks') : t('rank')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-white/5 bg-black/20 px-1 pt-2">
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto"
          role="img"
          aria-label="Marks and rank lifecycle chart"
        >
          {chart.yTicks.map((tick) => (
            <g key={`y-${tick.v}`}>
              <line
                x1={PAD_L}
                x2={CHART_W - PAD_R}
                y1={tick.y}
                y2={tick.y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
              <text x={PAD_L - 8} y={tick.y + 3} fontSize={9} textAnchor="end" fill="#64748b">
                {tick.v}
              </text>
            </g>
          ))}

          <path d={chart.comparePath} fill="none" stroke="#94a3b8" strokeWidth={1.75} strokeDasharray="5 4" />
          <path d={chart.ownPath} fill="none" stroke="var(--accent)" strokeWidth={2.75} strokeLinejoin="round" strokeLinecap="round" />

          {chart.comparePoints.map((p, idx) => (
            <circle key={`c-${idx}`} cx={p.x} cy={p.y} r={2.5} fill="#94a3b8" />
          ))}

          {chart.ownPoints.map((p, idx) => (
            <g key={`o-${idx}`}>
              <circle cx={p.x} cy={p.y} r={4.5} fill="var(--accent2)" stroke="#05070f" strokeWidth={1.75} />
              <text x={p.x} y={p.y - 10} fontSize={9} textAnchor="middle" fill="#cbd5e1" fontWeight={700}>
                {isMarks ? p.v : `#${p.v}`}
              </text>
              <line
                x1={p.x}
                x2={p.x}
                y1={chart.plotBottom}
                y2={chart.plotBottom + 4}
                stroke="rgba(148,163,184,0.45)"
                strokeWidth={1}
              />
              <text x={p.x} y={CHART_H - 10} fontSize={10} textAnchor="middle" fill="#94a3b8" fontWeight={600}>
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Ananya
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-slate-400" />
            {isMarks ? t('tableHeadAverage') : t('classMidpoint')}
          </span>
        </div>
        <span className={`font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {delta >= 0 ? '+' : ''}
          {delta} {isMarks ? t('marks').toLowerCase() : t('rank').toLowerCase()} · {t('trendText')}
        </span>
      </div>
    </Card>
  )
}
