import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useOrbitStore } from '../../../store/orbitStore'
import { StudyAssistant } from '../../student/StudyAssistant'
import { useStudentNav } from '../StudentNavContext'

/** Phase 7 — contextual Ask Orbit as a sheet over any screen. */
export function AskOrbitSheet() {
  const { askOrbitOpen, askOrbitSeed, closeAskOrbit } = useStudentNav()
  const setAiPrompt = useOrbitStore((s) => s.setAiPrompt)

  useEffect(() => {
    if (askOrbitOpen && askOrbitSeed) setAiPrompt(askOrbitSeed)
  }, [askOrbitOpen, askOrbitSeed, setAiPrompt])

  if (!askOrbitOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close Ask Orbit"
        onClick={closeAskOrbit}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ask Orbit"
        className="relative w-full sm:max-w-lg max-h-[88dvh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-[var(--border-strong)] bg-[var(--panel)] shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Ask Orbit</p>
            <p className="text-sm font-bold text-[var(--fg)]">Study help in context</p>
          </div>
          <button
            type="button"
            onClick={closeAskOrbit}
            className="h-9 w-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--fg)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto orbit-scroll px-3 py-3 student-embed">
          <StudyAssistant />
        </div>
      </div>
    </div>
  )
}
