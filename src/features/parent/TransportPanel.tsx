import { useEffect, useState } from 'react'
import { Bus, Gauge, Phone, RefreshCw } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow, StatTile } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'
import { ChildSwitcher } from '../../components/ui/ChildSwitcher'
import { fetchBusRoutes, relativeUpdated, type BusRouteRow } from '../../lib/opsSurfacesApi'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'

export function TransportPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const fleet = useOrbitStore((s) => s.fleet)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const tickBus = useOrbitStore((s) => s.tickBus)
  const showingSampleData = useOrbitStore((s) => s.showingSampleData)
  const triggerToast = useOrbitStore((s) => s.triggerToast)

  const [routes, setRoutes] = useState<BusRouteRow[]>([])
  const t = (key: string) => translate(lang, key)
  const bus = fleet.find((b) => b.id === 'bus_14') || fleet[0]
  const liveRoute = routes.find((r) => r.id === bus?.id) || routes[0]
  const useLiveStatus = isSupabaseConfigured() && routes.length > 0

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    void fetchBusRoutes().then(setRoutes)
  }, [])

  useEffect(() => {
    if (useLiveStatus || busReachedSchool) return
    const interval = window.setInterval(() => tickBus(), 1400)
    return () => window.clearInterval(interval)
  }, [useLiveStatus, busReachedSchool, tickBus])

  const routeX = 30 + ((useLiveStatus ? (liveRoute?.status === 'at_school' ? 92 : liveRoute?.status === 'en_route' ? 55 : 12) : busPosition) / 100) * 340
  const statusLabel = liveRoute
    ? liveRoute.status === 'en_route'
      ? t('busStatusEnRoute')
      : liveRoute.status === 'at_school'
        ? t('busStatusAtSchool')
        : liveRoute.status === 'cancelled'
          ? t('busStatusCancelled')
          : t('busStatusIdle')
    : busReachedSchool
      ? t('childReached')
      : t('busStatusEnRoute')

  return (
    <div className="space-y-6">
      <ChildSwitcher compact />
      {!useLiveStatus ? <DemoNotice detailKey="demoTransportHint" /> : null}
      <Panel
        title={t('busTracker')}
        subtitle={liveRoute?.routeLabel || bus?.route}
        action={
          useLiveStatus ? (
            <button
              type="button"
              className="btn-ghost px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white"
              onClick={() =>
                void fetchBusRoutes().then((rows) => {
                  setRoutes(rows)
                  triggerToast(t('busStatusRefreshed'))
                })
              }
            >
              <RefreshCw className="h-3.5 w-3.5 inline mr-1" aria-hidden />
              {t('refresh')}
            </button>
          ) : null
        }
      >
        <svg viewBox="0 0 400 90" className="w-full h-24" role="img" aria-label="Bus route map">
          <path d="M20,60 C 100,20 180,80 200,45 S 320,10 380,45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} strokeLinecap="round" />
          <path
            d="M20,60 C 100,20 180,80 200,45 S 320,10 380,45"
            fill="none"
            stroke="#22C55E"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="380"
            strokeDashoffset={380 - ((useLiveStatus ? (liveRoute?.status === 'at_school' ? 92 : 55) : busPosition) / 100) * 380}
          />
          <circle cx={20} cy={60} r={5} fill="#94a3b8" />
          <circle cx={380} cy={45} r={5} fill="#94a3b8" />
          <foreignObject x={routeX - 11} y={29} width={22} height={22}>
            <div className="h-full w-full rounded-full bg-[#22C55E] flex items-center justify-center">
              <Bus className="h-3 w-3 text-black" aria-hidden />
            </div>
          </foreignObject>
          <text x={20} y={78} fontSize={9} fill="#94a3b8">
            {t('homeStop')}
          </text>
          <text x={355} y={35} fontSize={9} fill="#94a3b8">
            {t('schoolStop')}
          </text>
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-white bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5">
          <span>{statusLabel}</span>
          {liveRoute ? (
            <span className="text-[10px] text-slate-400 font-semibold">
              {t('updatedAgo').replace('{time}', relativeUpdated(liveRoute.lastUpdatedAt))}
              {liveRoute.etaText ? ` · ETA ${liveRoute.etaText}` : ''}
            </span>
          ) : null}
        </div>
        {showingSampleData && !useLiveStatus ? (
          <p className="text-[10px] text-slate-500 mt-2">{t('busNoGpsHonest')}</p>
        ) : (
          <p className="text-[10px] text-slate-500 mt-2">{t('busNoGpsHonest')}</p>
        )}
      </Panel>

      {bus ? (
        <Panel title={t('liveTransit')}>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatTile
              label={t('status')}
              value={statusLabel}
              accent="var(--accent2)"
            />
            <StatTile label={t('capacity')} value={liveRoute?.capacity || bus.capacity} />
            <StatTile label="Driver" value={liveRoute?.driver || bus.driver} />
          </div>

          <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl accent-soft flex items-center justify-center shrink-0">
                <Gauge className="h-5 w-5 text-[var(--accent2)]" aria-hidden />
              </div>
              <div>
                <Eyebrow>Driver</Eyebrow>
                <h3 className="text-sm font-bold text-white">{liveRoute?.driver || bus.driver}</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" aria-hidden />
                  {liveRoute?.phone || bus.phone}
                </p>
              </div>
            </div>
          </Card>
        </Panel>
      ) : null}
    </div>
  )
}
