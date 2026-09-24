import { useEffect, useRef, useState } from 'react'
import { Eye, FileLock2, Lock, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { Card } from '../../components/ui/primitives'
import { useOrbitStore } from '../../store/orbitStore'
import {
  CONFIDENTIAL_CATEGORIES,
  CONFIDENTIAL_MAX_BYTES,
  formatDocSize,
  openConfidentialDoc,
} from '../../lib/confidentialDocs'
import type { ConfidentialDocCategory } from '../../types'

export function ConfidentialDocsSection({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  const lang = useOrbitStore((s) => s.lang)
  const docs = useOrbitStore((s) => s.confidentialDocs)
  const loadConfidentialDocs = useOrbitStore((s) => s.loadConfidentialDocs)
  const addConfidentialDoc = useOrbitStore((s) => s.addConfidentialDoc)
  const removeConfidentialDoc = useOrbitStore((s) => s.removeConfidentialDoc)

  const fileRef = useRef<HTMLInputElement>(null)
  const [docTitle, setDocTitle] = useState('')
  const [category, setCategory] = useState<ConfidentialDocCategory>('Other')
  const [uploading, setUploading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void loadConfidentialDocs()
  }, [loadConfidentialDocs])

  const onPickFile = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    const ok = await addConfidentialDoc(file, docTitle || file.name.replace(/\.[^.]+$/, ''), category)
    setUploading(false)
    if (ok) {
      setDocTitle('')
      setCategory('Other')
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onOpen = async (id: string) => {
    const doc = docs.find((d) => d.id === id)
    if (!doc) return
    setBusyId(id)
    const result = await openConfidentialDoc(doc)
    setBusyId(null)
    if (!result.ok) {
      useOrbitStore.getState().triggerToast(result.error)
      return
    }
    window.open(result.url, '_blank', 'noopener,noreferrer')
    if (result.revoke) {
      window.setTimeout(result.revoke, 60_000)
    }
  }

  const onDelete = async (id: string) => {
    if (!window.confirm(lang === 'te' ? 'ఈ ఫైల్‌ను తొలగించాలా?' : 'Remove this confidential file?')) return
    setBusyId(id)
    await removeConfidentialDoc(id)
    setBusyId(null)
  }

  const heading =
    title ?? (lang === 'te' ? 'రహస్య పత్రాలు' : 'Confidential Documents')
  const body =
    description ??
    (lang === 'te'
      ? 'జనన ధృవీకరణ, ఆధార్, రిపోర్ట్ కార్డులు వంటి ఫైల్‌లను ప్రైవేట్ వాల్ట్‌లో అప్‌లోడ్ చేయండి. మీకు మాత్రమే యాక్సెస్.'
      : 'Upload birth certificates, ID proofs, report cards, and other private files. Visible only to you — private vault with signed access.')

  return (
    <Card className="p-5 space-y-4 border border-amber-500/20 bg-amber-500/[0.03]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <FileLock2 className="h-4 w-4 text-amber-300" aria-hidden />
            {heading}
          </h3>
          <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">{body}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/25">
          <Lock className="h-3 w-3" aria-hidden />
          {lang === 'te' ? 'ప్రైవేట్' : 'Private'}
        </span>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {lang === 'te' ? 'శీర్షిక' : 'Document title'}
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder={lang === 'te' ? 'ఉదా. జనన ధృవీకరణ' : 'e.g. Birth certificate'}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {lang === 'te' ? 'వర్గం' : 'Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ConfidentialDocCategory)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-amber-400/40"
            >
              {CONFIDENTIAL_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.txt,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-100 border border-amber-400/30 hover:bg-amber-500/25 transition disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" aria-hidden />
            {uploading
              ? lang === 'te'
                ? 'అప్‌లోడ్ అవుతోంది…'
                : 'Uploading…'
              : lang === 'te'
                ? 'ఫైల్ అప్‌లోడ్'
                : 'Upload file'}
          </button>
          <p className="text-[10px] text-slate-500">
            PDF / image / Word · max {Math.round(CONFIDENTIAL_MAX_BYTES / (1024 * 1024))} MB
          </p>
        </div>

        <p className="text-[10px] text-slate-500 flex items-start gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
          {lang === 'te'
            ? 'క్లౌడ్‌లో ప్రైవేట్ బకెట్ + సైన్డ్ లింక్‌లు; ఆఫ్‌లైన్‌లో ఈ డివైస్ IndexedDB వాల్ట్.'
            : 'Cloud: private bucket + short-lived signed links. Offline/demo: device IndexedDB vault (not public URLs).'}
        </p>
      </div>

      <div className="space-y-2">
        {docs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            {lang === 'te' ? 'ఇంకా రహస్య ఫైల్‌లు లేవు.' : 'No confidential files yet.'}
          </p>
        ) : (
          docs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold text-white truncate">{doc.title}</p>
                <p className="text-[10px] text-slate-400">
                  {doc.category} · {doc.fileName} · {formatDocSize(doc.sizeBytes)} ·{' '}
                  {doc.storage === 'cloud'
                    ? lang === 'te'
                      ? 'క్లౌడ్ వాల్ట్'
                      : 'Cloud vault'
                    : lang === 'te'
                      ? 'డివైస్ వాల్ట్'
                      : 'Device vault'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busyId === doc.id}
                  onClick={() => void onOpen(doc.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50"
                >
                  <Eye className="h-3 w-3" aria-hidden />
                  {lang === 'te' ? 'తెరువు' : 'Open'}
                </button>
                <button
                  type="button"
                  disabled={busyId === doc.id}
                  onClick={() => void onDelete(doc.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-200 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                  {lang === 'te' ? 'తొలగించు' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
