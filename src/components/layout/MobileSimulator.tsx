import { CreditCard, Truck } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'

export function MobileSimulator() {
  const active = useOrbitStore((s) => s.mobileSimulator)
  const studyScore = useOrbitStore((s) => s.studyScore)
  const busPosition = useOrbitStore((s) => s.busPosition)
  const busReachedSchool = useOrbitStore((s) => s.busReachedSchool)
  const tasks = useOrbitStore((s) => s.tasks)
  const outstandingFees = useOrbitStore((s) => s.outstandingFees)
  const setActiveTab = useOrbitStore((s) => s.setActiveTab)

  if (!active) return null

  const pending = tasks.filter((t) => !t.completed).length

  return (
    <aside className="w-[340px] border-l border-white/10 hidden xl:flex flex-col p-5 items-center shrink-0 bg-[#070913]/70">
      <div className="w-[300px] h-[620px] bg-[#070913] rounded-[40px] border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden p-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-700 rounded-b-xl z-20" />
        <div className="mt-6 space-y-3 overflow-y-auto orbit-scroll flex-1">
          <div>
            <h4 className="text-slate-300 text-[10px] font-bold uppercase">Ananya's Companion</h4>
            <p className="text-[9px] text-slate-500">Live preview synced to desktop state</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Academic Health Score</span>
            <p className="text-2xl font-black text-white mt-1">{studyScore}</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#7C6CFF]" style={{ width: `${studyScore}%` }} />
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Homework</span>
            <p className="text-xs font-bold text-white">{pending} pending</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className="w-full bg-white/5 rounded-2xl p-3 border border-white/10 text-left"
          >
            <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Fees
            </span>
            <p className="text-xs font-bold text-white mt-1">
              {outstandingFees > 0 ? `₹${outstandingFees.toLocaleString()} due` : 'Cleared'}
            </p>
          </button>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 space-y-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase flex items-center gap-1">
              <Truck className="h-3 w-3" /> Bus Tracking
            </span>
            <h4 className="text-xs font-bold text-white">
              {busReachedSchool ? 'Reached school' : 'Bus is on the way'}
            </h4>
            <div className="relative h-6 flex items-center">
              <div className="absolute left-0 right-0 h-1 bg-white/10 rounded-full" />
              <div className="absolute h-1 bg-[#22C55E] rounded-full" style={{ width: `${busPosition}%` }} />
              <div
                className="absolute h-3.5 w-3.5 rounded-full bg-[#22C55E]"
                style={{ left: `calc(${busPosition}% - 7px)` }}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-24 bg-slate-700 rounded-full" />
      </div>
    </aside>
  )
}
