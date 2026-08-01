import { useEffect } from 'react'
import { Bus, Phone } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'

const BUS_COLORS = ['#22C55E', '#4DA6FF', '#FFB454']

export function SchoolFleet() {
  const lang = useOrbitStore((s) => s.lang)
  const fleet = useOrbitStore((s) => s.fleet)
  const tickBus = useOrbitStore((s) => s.tickBus)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const t = (key: string) => translate(lang, key)

  useEffect(() => {
    const interval = window.setInterval(() => tickBus(), 1600)
    return () => window.clearInterval(interval)
  }, [tickBus])

  return (
    <div className="space-y-6">
      <DemoNotice detailKey="demoFleetHint" />
      <Panel title={t('schoolFleetTitle')} subtitle={t('schoolFleetDesc')}>
        <svg viewBox="0 0 400 120" className="w-full h-32" role="img" aria-label="Fleet map">
          <rect x={10} y={20} width={380} height={80} rx={14} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
          <line x1={20} y1={60} x2={380} y2={60} stroke="rgba(255,255,255,0.1)" strokeWidth={4} strokeLinecap="round" />
          <circle cx={20} cy={60} r={4} fill="#94a3b8" />
          <circle cx={380} cy={60} r={4} fill="#94a3b8" />
          <text x={16} y={100} fontSize={9} fill="#94a3b8">
            Depot
          </text>
          <text x={355} y={100} fontSize={9} fill="#94a3b8">
            School
          </text>
          {fleet.map((bus, idx) => {
            const x = 20 + (bus.position / 100) * 360
            const color = bus.active ? BUS_COLORS[idx % BUS_COLORS.length] : '#475569'
            return (
              <g key={bus.id}>
                <foreignObject x={x - 11} y={49} width={22} height={22}>
                  <div
                    className="h-full w-full rounded-full flex items-center justify-center"
                    style={{ background: color }}
                    title={bus.route}
                  >
                    <Bus className="h-3 w-3 text-black" aria-hidden />
                  </div>
                </foreignObject>
                <text x={x} y={44} fontSize={8} textAnchor="middle" fill={bus.active ? '#e2e8f0' : '#64748b'}>
                  {bus.id}
                </text>
              </g>
            )
          })}
        </svg>
      </Panel>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleet.map((bus, idx) => (
          <Card key={bus.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: bus.active ? BUS_COLORS[idx % BUS_COLORS.length] : '#475569' }}
                />
                <Eyebrow>{bus.route}</Eyebrow>
              </div>
              <span
                className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${
                  bus.active
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                    : 'bg-white/5 text-slate-500 border-white/10'
                }`}
              >
                {bus.active ? 'Active' : 'Idle'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p>
                <span className="text-slate-500">Driver: </span>
                {bus.driver}
              </p>
              <p>
                <span className="text-slate-500">Speed: </span>
                {Math.round(bus.speed)} km/h
              </p>
              <p>
                <span className="text-slate-500">Capacity: </span>
                {bus.capacity}
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerToast(`${t('callDriver')}: ${bus.driver} (${bus.phone}) — simulated.`)}
              disabled={!bus.active}
              className="btn-ghost w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-40"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {t('callDriver')}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
