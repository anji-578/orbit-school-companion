import { useEffect } from 'react'
import { Bus, Gauge, Phone, Users } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'

export function TransportPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const fleet = useOrbitStore((s) => s.fleet)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const tickBus = useOrbitStore((s) => s.tickBus)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const t = (key: string) => translate(lang, key)
  const bus = fleet.find((b) => b.id === 'bus_14')

  useEffect(() => {
    if (busReachedSchool) return
    const interval = window.setInterval(() => tickBus(), 1400)
    return () => window.clearInterval(interval)
  }, [busReachedSchool, tickBus])

  const routeX = 30 + (busPosition / 100) * 340

  return (
    <div className="space-y-6">
      <DemoNotice detailKey="demoTransportHint" />
      <Panel title={t('busTracker')} subtitle={bus?.route}>
        <svg viewBox="0 0 400 90" className="w-full h-24" role="img" aria-label="Bus route map">
          <path d="M20,60 C 100,20 180,80 200,45 S 320,10 380,45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} strokeLinecap="round" />
          <path
            d="M20,60 C 100,20 180,80 200,45 S 320,10 380,45"
            fill="none"
            stroke="#22C55E"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="380"
            strokeDashoffset={380 - (busPosition / 100) * 380}
          />
          <circle cx={20} cy={60} r={5} fill="#94a3b8" />
          <circle cx={380} cy={45} r={5} fill="#94a3b8" />
          <foreignObject x={routeX - 11} y={29} width={22} height={22}>
            <div className="h-full w-full rounded-full bg-[#22C55E] flex items-center justify-center">
              <Bus className="h-3 w-3 text-black" aria-hidden />
            </div>
          </foreignObject>
          <text x={20} y={78} fontSize={9} fill="#94a3b8">
            Home
          </text>
          <text x={355} y={35} fontSize={9} fill="#94a3b8">
            School
          </text>
        </svg>

        {busReachedSchool ? (
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold justify-center bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2.5">
            {t('childReached')}
          </div>
        ) : null}
      </Panel>

      {bus ? (
        <Panel title={t('liveTransit')}>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatTile label="Speed" value={`${Math.round(bus.speed)} km/h`} accent="var(--accent2)" />
            <StatTile label="Capacity" value={bus.capacity} />
            <StatTile label="Position" value={`${Math.round(busPosition)}%`} />
          </div>

          <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl accent-soft flex items-center justify-center shrink-0">
                <Gauge className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
              </div>
              <div>
                <Eyebrow>Driver</Eyebrow>
                <h3 className="text-sm font-bold text-white">{bus.driver}</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Users className="h-3 w-3" aria-hidden /> {bus.route}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerToast(`${t('callDriver')}: ${bus.driver} (${bus.phone}) — simulated.`)}
              className="btn-accent flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {t('callDriver')}
            </button>
          </Card>
        </Panel>
      ) : null}
    </div>
  )
}
