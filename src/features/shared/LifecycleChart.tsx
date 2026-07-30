import { useMemo } from 'react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { subjectProgressHistory } from '../../data/demo'
import { Card, Eyebrow } from '../../components/ui/primitives'
import type { LifecycleMetric } from '../../types'

const SUBJECT_KEYS = ['mathSubject', 'scienceSubject', 'chemLabSubject'] as const
const CLASS_SIZE = 42

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
    const count = Math.min(
      history.exams.length,
      history.marks.length,
      history.ranks.length,
      history.classAvg.length,
    )
    const exams = history.exams.slice(0, count)
    const ownVals = (isMarks ? history.marks : history.ranks).slice(0, count)
    const compareVals = (isMarks ? history.classAvg : exams.map(() => CLASS_SIZE / 2)).slice(0, count)
    const maxVal = isMarks ? 50 : CLASS_SIZE

    const yPct = (val: number) => {
      const clamped = Math.max(0, Math.min(maxVal, val))
      const ratio = isMarks ? clamped / maxVal : 1 - clamped / maxVal
      // Keep plotting band inside padded area (8% top, 18% bottom for labels)
      return 8 + (1 - ratio) * 74
    }
    const xPct = (idx: number) => (count <= 1 ? 50 : (idx / (count - 1)) * 100)

    const points = ownVals.map((v, idx) => ({
      x: xPct(idx),
      y: yPct(v),
      v,
      label: shortExamLabel(exams[idx] ?? ''),
    }))
    const compare = compareVals.map((v, idx) => ({ x: xPct(idx), y: yPct(v), v }))

    const line = (pts: { x: number; y: number }[]) =>
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')

    const ownPath = line(points)
    const areaPath =
      points.length > 0
        ? `${ownPath} L${points[points.length - 1]!.x.toFixed(2)},92 L${points[0]!.x.toFixed(2)},92 Z`
        : ''

    const yTicks = isMarks
      ? [
          { label: '50', y: yPct(50) },
          { label: '25', y: yPct(25) },
          { label: '0', y: yPct(0) },
        ]
      : [
          { label: '1', y: yPct(1) },
          { label: '21', y: yPct(21) },
          { label: '42', y: yPct(42) },
        ]

    return { points, compare, ownPath, comparePath: line(compare), areaPath, yTicks }
  }, [history, isMarks])

  const latestOwn = isMarks ? history.marks[history.marks.length - 1] : history.ranks[history.ranks.length - 1]
  const delta = isMarks
    ? history.marks[history.marks.length - 1] - history.marks[0]
    : history.ranks[0] - history.ranks[history.ranks.length - 1]

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow>{t('ananyaProgress')}</Eyebrow>
          <p className="text-[15px] font-bold text-white mt-0.5 truncate">
            {t(selectedLifecycleSubject)}
            <span className="text-slate-500"> · </span>
            <span className="text-[var(--accent2)]">{isMarks ? `${latestOwn}/50` : `#${latestOwn}`}</span>
          </p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${
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

      <div className="relative w-full h-[168px] sm:h-[180px] rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] overflow-hidden">
        {/* Y-axis labels */}
        <div className="absolute inset-y-0 left-0 w-7 flex flex-col justify-between py-[8%] pb-[18%] pl-1.5 pointer-events-none z-10">
          {chart.yTicks.map((tick) => (
            <span key={tick.label} className="text-[9px] font-semibold text-slate-500 leading-none">
              {tick.label}
            </span>
          ))}
        </div>

        {/* Full-bleed plot */}
        <div className="absolute inset-0 left-7 right-2 top-1 bottom-0">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="orbitLifeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {chart.yTicks.map((tick) => (
              <line
                key={`g-${tick.label}`}
                x1="0"
                x2="100"
                y1={tick.y}
                y2={tick.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={0.35}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {chart.areaPath ? <path d={chart.areaPath} fill="url(#orbitLifeFill)" /> : null}
            <path
              d={chart.comparePath}
              fill="none"
              stroke="#64748b"
              strokeWidth={1.25}
              strokeDasharray="3 2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={chart.ownPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.25}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Perfect circles + values (not distorted by SVG stretch) */}
          {chart.points.map((p) => (
            <div
              key={`${p.label}-${p.v}`}
              className="absolute z-10"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-200 whitespace-nowrap">
                  {isMarks ? p.v : `#${p.v}`}
                </span>
                <span className="block h-2.5 w-2.5 rounded-full bg-[var(--accent2)] ring-2 ring-[#0b1020] shadow-[0_0_10px_color-mix(in_srgb,var(--accent)_55%,transparent)]" />
              </div>
            </div>
          ))}

          {/* X labels aligned to points */}
          {chart.points.map((p) => (
            <span
              key={`lbl-${p.label}`}
              className="absolute bottom-1.5 text-[9px] font-semibold text-slate-400 -translate-x-1/2"
              style={{ left: `${p.x}%` }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Ananya
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 border-t border-dashed border-slate-500" />
          {isMarks ? t('tableHeadAverage') : t('classMidpoint')}
        </span>
        <span className="ml-auto font-semibold text-slate-400">{t('trendText')}</span>
      </div>
    </Card>
  )
}
