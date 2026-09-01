import { useState } from 'react'
import {
  Calendar,
  Check,
  CreditCard,
  MapPin,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'
import { Panel, Card } from '../../components/ui/primitives'
import type { CompetitionCategory, OrbitCompetition } from '../../types'

const CATEGORY_ICONS: Record<CompetitionCategory, string> = {
  Quiz: '🧠',
  'Spell Bee': '🐝',
  Drawing: '🎨',
  Coding: '💻',
  Chess: '♟️',
  Debate: '🗣️',
  'Public Speaking': '🎤',
  Mathematics: '🔢',
  Science: '🔬',
  Sports: '🏸',
  Karate: '🥋',
  Music: '🎵',
}

export function CompetitionsPanel() {
  const lang = useOrbitStore((s) => s.lang)
  const competitions = useOrbitStore((s) => s.competitions)
  const enrollments = useOrbitStore((s) => s.competitionEnrollments)
  const registerForCompetition = useOrbitStore((s) => s.registerForCompetition)
  const payForCompetition = useOrbitStore((s) => s.payForCompetition)
  const completeCompetition = useOrbitStore((s) => s.completeCompetition)

  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory | 'All'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [checkoutComp, setCheckoutComp] = useState<OrbitCompetition | null>(null)
  const [upiId, setUpiId] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesCategory = selectedCategory === 'All' || comp.category === selectedCategory
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.city.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleRegister = (id: string) => {
    registerForCompetition(id)
    useOrbitStore.getState().triggerToast('Registered! Complete payment to secure your slot.')
  }

  const handlePayClick = (comp: OrbitCompetition) => {
    setCheckoutComp(comp)
  }

  const handlePaymentSubmit = () => {
    if (!checkoutComp) return
    setIsPaying(true)
    setTimeout(() => {
      payForCompetition(checkoutComp.id)
      setIsPaying(false)
      setCheckoutComp(null)
      useOrbitStore.getState().triggerToast('Payment successful! You are enrolled.')
      useOrbitStore.getState().pushNotification({
        role: 'student',
        title: 'Competition Enrolled',
        body: `You are fully enrolled in ${checkoutComp.title}. Get ready!`,
      })
      useOrbitStore.getState().pushNotification({
        role: 'parent',
        title: 'Competition Enrolled',
        body: `Ananya is enrolled in ${checkoutComp.title} (${checkoutComp.city}) on ${checkoutComp.date}.`,
      })
    }, 1200)
  }

  const handleSimulateParticipation = (id: string) => {
    const rank = Math.floor(Math.random() * 100) + 1
    completeCompetition(id, rank)
    const comp = competitions.find((c) => c.id === id)
    useOrbitStore.getState().triggerToast(`Result posted! Rank ${rank} / ${comp?.participantCount}`)
    useOrbitStore.getState().pushNotification({
      role: 'student',
      title: 'Competition Result Posted',
      body: `You achieved Rank ${rank} in ${comp?.title}! Added to your profile.`,
    })
    useOrbitStore.getState().pushNotification({
      role: 'parent',
      title: 'Competition Achievement!',
      body: `Ananya achieved Rank ${rank} / ${comp?.participantCount} in ${comp?.title}!`,
    })
  }

  const getEnrollment = (id: string) => enrollments.find((e) => e.competitionId === id)

  const categories: (CompetitionCategory | 'All')[] = [
    'All',
    'Quiz',
    'Spell Bee',
    'Drawing',
    'Coding',
    'Chess',
    'Debate',
    'Public Speaking',
    'Mathematics',
    'Science',
    'Sports',
    'Karate',
    'Music',
  ]

  const totalParticipated = enrollments.filter((e) => e.status === 'result').length

  return (
    <Panel
      title={lang === 'te' ? 'పోటీలు' : 'Orbit Competitions'}
      subtitle={lang === 'te' ? 'విద్యార్థి పోటీలను కనుగొనండి మరియు నమోదు చేయండి' : 'Discover, register, and participate in inter-school competitions'}
    >
      {/* Summary Banner */}
      <div className="p-5 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-white font-display flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" /> Achievement Loop
          </h3>
          <p className="text-xs text-slate-300">
            Ananya has participated in <strong className="text-violet-300">{totalParticipated}</strong> competition{totalParticipated !== 1 ? 's' : ''} this year.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <p className="text-xs text-slate-400">Enrolled</p>
            <p className="text-lg font-black text-white">{enrollments.filter((e) => e.status === 'paid').length}</p>
          </div>
          <div className="text-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <p className="text-xs text-slate-400">Wins / Results</p>
            <p className="text-lg font-black text-emerald-300">{totalParticipated}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search competitions or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          {/* Category Scroller */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[var(--accent)] text-black'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {cat === 'All' ? '🌐 All' : `${CATEGORY_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompetitions.map((comp) => {
          const enrollment = getEnrollment(comp.id)
          const icon = CATEGORY_ICONS[comp.category]

          return (
            <Card key={comp.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl" aria-hidden>{icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/10">
                    {comp.category}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{comp.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {comp.city}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{comp.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {comp.date}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {comp.participantCount} slots
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-black text-white">₹{comp.priceInr}</span>
                  
                  {/* Action CTA */}
                  {!enrollment ? (
                    <button
                      type="button"
                      onClick={() => handleRegister(comp.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-black text-xs font-bold hover:opacity-90 transition"
                    >
                      Register
                    </button>
                  ) : enrollment.status === 'registered' ? (
                    <button
                      type="button"
                      onClick={() => handlePayClick(comp)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition flex items-center gap-1"
                    >
                      <CreditCard className="h-3 w-3" /> Pay ₹{comp.priceInr}
                    </button>
                  ) : enrollment.status === 'paid' ? (
                    <button
                      type="button"
                      onClick={() => handleSimulateParticipation(comp.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition flex items-center gap-1"
                    >
                      Simulate Play
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                      <Check className="h-3.5 w-3.5" /> Rank {enrollment.rank} / {enrollment.totalParticipants}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}

        {filteredCompetitions.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-sm text-slate-500">No competitions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {checkoutComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#0D1120] border border-white/10 rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-extrabold text-white font-display">Simulated Checkout</h3>
              <button type="button" onClick={() => setCheckoutComp(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-slate-400">COMPETITION</p>
              <p className="text-sm font-bold text-white">{checkoutComp.title}</p>
              <p className="text-xs text-slate-400">{checkoutComp.city} · {checkoutComp.date}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-300">Total Amount</span>
              <span className="text-base font-black text-white">₹{checkoutComp.priceInr}</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400">Payment Method (UPI Simulation)</p>
              <input
                type="text"
                placeholder="Enter UPI ID (e.g. ananya@okaxis)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutComp(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPaying || !upiId.trim()}
                onClick={handlePaymentSubmit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-xs font-bold text-black transition disabled:opacity-50"
              >
                {isPaying ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
