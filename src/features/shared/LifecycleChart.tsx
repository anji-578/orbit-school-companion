import { useMemo } from 'react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { subjectProgressHistory } from '../../data/demo'
import { Card, Eyebrow } from '../../components/ui/primitives'
import type { LifecycleMetric } from '../../types'

const SUBJECT_KEYS = ['mathSubject', 'scienceSubject', 'chemLabSubject'] as const
const CLASS_SIZE = 42
const CHART_W = 460
const CHART_H = 190
const PAD_X = 30
const PAD_Y = 18

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
    const innerW = CHART_W - PAD_X * 2
    const innerH = CHART_H - PAD_Y * 2
    const own = isMarks ? history.marks : history.ranks
    const compare = isMarks ? history.classAvg : history.exams.map(() => CLASS_SIZE / 2)
    const maxVal = isMarks ? 50 : CLASS_SIZE

    const toY = (val: number) => {
      const ratio = isMarks ? val / maxVal : 1 - val / maxVal
      return PAD_Y + innerH - ratio * innerH
    }
    const toX = (idx: number) => PAD_X + (innerW / Math.max(1, own.length - 1)) * idx

    const ownPoints = own.map((v, idx) => ({ x: toX(idx), y: toY(v), v }))
    const comparePoints = compare.map((v, idx) => ({ x: toX(idx), y: toY(v), v }))
    const toPath = (pts: { x: number; y: number }[]) =>
      pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

    return { ownPoints, comparePoints, ownPath: toPath(ownPoints), comparePath: toPath(comparePoints) }
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

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-44" role="img" aria-label="Marks and rank lifecycle chart">
        {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={CHART_W - PAD_X}
            y1={PAD_Y + (CHART_H - PAD_Y * 2) * f}
            y2={PAD_Y + (CHART_H - PAD_Y * 2) * f}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}
        <path d={chart.comparePath} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" />
        <path d={chart.ownPath} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
        {chart.ownPoints.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r={3.5} fill="var(--accent2)" stroke="#05070f" strokeWidth={1.5} />
        ))}
        {history.exams.map((exam, idx) => (
          <text
            key={exam}
            x={chart.ownPoints[idx]?.x ?? 0}
            y={CHART_H - 3}
            fontSize={8}
            textAnchor="middle"
            fill="#94a3b8"
          >
            {exam.split(' ')[0]}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400 pt-1 border-t border-white/10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Ananya
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-dashed border-slate-400" />
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
