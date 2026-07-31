import { X } from 'lucide-react'

/** Inline / modal preview for teacher-uploaded syllabus notes. */
export function NotePreview({
  open,
  onClose,
  name,
  dataUrl,
  mime,
}: {
  open: boolean
  onClose: () => void
  name?: string
  dataUrl?: string
  mime?: string
}) {
  if (!open || !dataUrl) return null

  const isImage = Boolean(mime?.startsWith('image/')) || /\.(png|jpe?g|webp|gif)$/i.test(name || '')
  const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(name || '')

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close preview" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[88dvh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0B1220] shadow-2xl flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
          <p className="text-xs font-bold text-white truncate">{name || 'Teacher notes'}</p>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 sm:p-4 bg-black/30 min-h-[240px]">
          {isImage ? (
            <img src={dataUrl} alt={name || 'Note'} className="max-w-full mx-auto rounded-xl" />
          ) : isPdf ? (
            <iframe title={name || 'PDF notes'} src={dataUrl} className="w-full h-[70dvh] rounded-xl bg-white" />
          ) : (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-slate-300">Preview not available for this file type.</p>
              <a href={dataUrl} download={name || 'notes'} className="btn-accent inline-flex px-4 py-2 rounded-xl text-xs font-bold">
                Download file
              </a>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex justify-end">
          <a href={dataUrl} download={name || 'notes'} className="btn-ghost px-3 py-2 rounded-lg text-[11px] font-bold text-white">
            Download
          </a>
        </div>
      </div>
    </div>
  )
}
