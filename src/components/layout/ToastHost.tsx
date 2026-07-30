import { Sparkles, X } from 'lucide-react'
import { useOrbitStore } from '../../store/orbitStore'

export function ToastHost() {
  const toast = useOrbitStore((s) => s.toast)
  const clearToast = useOrbitStore((s) => s.clearToast)
  if (!toast) return null
  return (
    <div
      className="fixed bottom-5 right-5 bg-[#0D1120] border border-white/10 text-white px-5 py-4 rounded-2xl shadow-2xl z-[60] flex items-center gap-3 max-w-sm toast-in"
      role="status"
      aria-live="polite"
    >
      <Sparkles className="h-5 w-5 text-[#7C6CFF] shrink-0" aria-hidden />
      <span className="text-xs font-semibold leading-relaxed flex-1">{toast}</span>
      <button type="button" onClick={clearToast} className="text-slate-400 hover:text-white" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
