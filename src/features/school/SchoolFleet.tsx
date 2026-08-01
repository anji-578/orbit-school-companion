import { useEffect, useState } from 'react'
import { Bus, Phone } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { translate } from '../../i18n'
import { Panel, Card, Eyebrow } from '../../components/ui/primitives'
import { DemoNotice } from '../../components/ui/DemoNotice'
import {
  fetchBusRoutes,
  relativeUpdated,
  updateBusRouteStatus,
  type BusRouteRow,
} from '../../lib/opsSurfacesApi'
import { isSupabaseConfigured } from '../../lib/supabaseConfig'

const BUS_COLORS = ['#22C55E', '#4DA6FF', '#FFB454']
const STATUSES: BusRouteRow['status'][] = ['en_route', 'at_school', 'idle', 'cancelled']

export function SchoolFleet() {
  const lang = useOrbitStore((s) => s.lang)
  const fleet = useOrbitStore((s) => s.fleet)
  const tickBus = useOrbitStore((s) => s.tickBus)
  const hydrateFromSupabase = useOrbitStore((s) => s.hydrateFromSupabase)
  const triggerToast = useOrbitStore((s) => s.triggerToast)
  const [routes, setRoutes] = useState<BusRouteRow[]>([])

  const t = (key: string) => translate(lang, key)
  const useLive = isSupabaseConfigured() && routes.length > 0

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    void fetchBusRoutes().then(setRoutes)
  }, [])

  useEffect(() => {
    if (useLive) return
    const interval = window.setInterval(() => tickBus(), 1600)
    return () => window.clearInterval(interval)
  }, [useLive, tickBus])

  const onStatus = async (id: string, status: BusRouteRow['status']) => {
    const result = await updateBusRouteStatus(id, status, status === 'en_route' ? '~10 min' : null)
    if (!result.ok) {
      triggerToast(result.error || 'Update failed')
      return
    }
    setRoutes(await fetchBusRoutes())
    void hydrateFromSupabase()
    triggerToast(t('busStatusUpdated'))
  }

  const displayFleet = useLive
    ? routes.map((r) => ({
        id: r.id,
        route: r.routeLabel || r.name,
        active: r.status === 'en_route' || r.status === 'at_school',
        driver: r.driver,
        phone: r.phone,
        capacity: r.capacity,
        position: r.status === 'at_school' ? 92 : r.status === 'en_route' ? 55 : 8,
        speed: r.status === 'en_route' ? 32 : 0,
        status: r.status,
        updated: r.lastUpdatedAt,
        eta: r.etaText,
      }))
    : fleet.map((b) => ({ ...b, status: b.active ? 'en_route' : 'idle', updated: '', eta: null as string | null }))

  return (
    <div className="space-y-6">
      {!useLive ? <DemoNotice detailKey="demoFleetHint" /> : null}
      <Panel title={t('schoolFleetTitle')} subtitle={t('schoolFleetDesc')}>
        <p className="text-[11px] text-slate-400 mb-3">{t('busNoGpsHonest')}</p>
        <svg viewBox="0 0 400 120" className="w-full h-32" role="img" aria-label="Fleet map">
          <rect x={10} y={20} width={380} height={80} rx={14} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
          <line x1={20} y1={60} x2={380} y2={60} stroke="rgba(255,255,255,0.1)" strokeWidth={4} strokeLinecap="round" />
          <circle cx={20} cy={60} r={4} fill="#94a3b8" />
          <circle cx={380} cy={60} r={4} fill="#94a3b8" />
          {displayFleet.map((bus, idx) => {
            const x = 20 + (bus.position / 100) * 360
            const color = bus.active ? BUS_COLORS[idx % BUS_COLORS.length] : '#475569'
            return (
              <g key={bus.id}>
                <foreignObject x={x - 11} y={49} width={22} height={22}>
                  <div className="h-full w-full rounded-full flex items-center justify-center" style={{ background: color }}>
                    <Bus className="h-3 w-3 text-black" aria-hidden />
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </Panel>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayFleet.map((bus, idx) => (
          <Card key={bus.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: bus.active ? BUS_COLORS[idx % BUS_COLORS.length] : '#475569' }}
                />
                <Eyebrow>{bus.route}</Eyebrow>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <p>
                <span className="text-slate-500">Driver: </span>
                {bus.driver}
              </p>
              <p className="flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden />
                {bus.phone}
              </p>
              <p>
                <span className="text-slate-500">{t('capacity')}: </span>
                {bus.capacity}
              </p>
              {'updated' in bus && bus.updated ? (
                <p className="text-slate-500">
                  {t('updatedAgo').replace('{time}', relativeUpdated(bus.updated))}
                </p>
              ) : null}
            </div>
            {useLive ? (
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => void onStatus(bus.id, status)}
                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${
                      bus.status === status
                        ? 'bg-[var(--accent)] text-black border-transparent'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  )
}
