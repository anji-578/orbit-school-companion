import { getSupabase, isSupabaseConfigured } from './supabase'
import type { ConfidentialDocCategory, ConfidentialDocument } from '../types'

const BUCKET = 'student-confidential'
const IDB_NAME = 'orbit-confidential-vault'
const IDB_STORE = 'blobs'
const META_KEY = 'orbit-confidential-docs-meta'
export const CONFIDENTIAL_MAX_BYTES = 5 * 1024 * 1024

export const CONFIDENTIAL_CATEGORIES: ConfidentialDocCategory[] = [
  'Birth Certificate',
  'ID / Aadhaar',
  'Report Card',
  'Medical',
  'Passport',
  'Admission',
  'Lesson Plan',
  'Certificates',
  'Other',
]

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
])

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

async function idbPut(id: string, blob: Blob) {
  const db = await openIdb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB put failed'))
  })
  db.close()
}

async function idbGet(id: string): Promise<Blob | null> {
  const db = await openIdb()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).get(id)
    req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB get failed'))
  })
  db.close()
  return blob
}

async function idbDelete(id: string) {
  const db = await openIdb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'))
  })
  db.close()
}

function readLocalMeta(): ConfidentialDocument[] {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ConfidentialDocument[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalMeta(docs: ConfidentialDocument[]) {
  localStorage.setItem(META_KEY, JSON.stringify(docs))
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, '_').slice(0, 80)
}

export function validateConfidentialFile(file: File): string | null {
  if (file.size <= 0) return 'File is empty.'
  if (file.size > CONFIDENTIAL_MAX_BYTES) return 'File must be 5 MB or smaller.'
  const mime = file.type || 'application/octet-stream'
  const okExt = /\.(pdf|png|jpe?g|webp|gif|docx?|txt)$/i.test(file.name)
  if (!ALLOWED_MIME.has(mime) && !okExt) {
    return 'Allowed: PDF, images, Word, or text files.'
  }
  return null
}

export function formatDocSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function getAuthUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export async function listConfidentialDocs(): Promise<ConfidentialDocument[]> {
  const userId = await getAuthUserId()
  if (userId) {
    const supabase = getSupabase()
    if (supabase) {
      const { data, error } = await supabase
        .from('student_confidential_docs')
        .select('id, title, category, file_name, mime_type, size_bytes, storage_path, created_at')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
      if (!error && data) {
        return data.map((row) => ({
          id: row.id as string,
          title: row.title as string,
          category: row.category as ConfidentialDocCategory,
          fileName: row.file_name as string,
          mimeType: row.mime_type as string,
          sizeBytes: Number(row.size_bytes) || 0,
          storagePath: row.storage_path as string,
          createdAt: row.created_at as string,
          storage: 'cloud' as const,
        }))
      }
    }
  }
  return readLocalMeta()
}

export async function uploadConfidentialDoc(input: {
  file: File
  title: string
  category: ConfidentialDocCategory
}): Promise<{ ok: true; doc: ConfidentialDocument } | { ok: false; error: string }> {
  const validation = validateConfidentialFile(input.file)
  if (validation) return { ok: false, error: validation }

  const title = input.title.trim() || input.file.name
  const mimeType = input.file.type || 'application/octet-stream'
  const userId = await getAuthUserId()

  if (userId) {
    const supabase = getSupabase()
    if (supabase) {
      const id = crypto.randomUUID()
      const path = `${userId}/${id}_${safeFileName(input.file.name)}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, input.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: mimeType,
      })
      if (!upErr) {
        const { data, error } = await supabase
          .from('student_confidential_docs')
          .insert({
            id,
            owner_id: userId,
            title,
            category: input.category,
            file_name: input.file.name,
            mime_type: mimeType,
            size_bytes: input.file.size,
            storage_path: path,
          })
          .select('id, title, category, file_name, mime_type, size_bytes, storage_path, created_at')
          .single()
        if (!error && data) {
          return {
            ok: true,
            doc: {
              id: data.id as string,
              title: data.title as string,
              category: data.category as ConfidentialDocCategory,
              fileName: data.file_name as string,
              mimeType: data.mime_type as string,
              sizeBytes: Number(data.size_bytes) || 0,
              storagePath: data.storage_path as string,
              createdAt: data.created_at as string,
              storage: 'cloud',
            },
          }
        }
        await supabase.storage.from(BUCKET).remove([path])
        return { ok: false, error: error?.message || 'Could not save document metadata.' }
      }
      // Fall through to local vault if cloud upload fails (demo / policy)
    }
  }

  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  try {
    await idbPut(id, input.file)
  } catch {
    return { ok: false, error: 'Could not store file securely on this device.' }
  }
  const doc: ConfidentialDocument = {
    id,
    title,
    category: input.category,
    fileName: input.file.name,
    mimeType,
    sizeBytes: input.file.size,
    storagePath: id,
    createdAt: new Date().toISOString(),
    storage: 'local',
  }
  writeLocalMeta([doc, ...readLocalMeta().filter((d) => d.id !== id)])
  return { ok: true, doc }
}

export async function deleteConfidentialDoc(doc: ConfidentialDocument): Promise<{ ok: boolean; error?: string }> {
  if (doc.storage === 'cloud') {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.storage.from(BUCKET).remove([doc.storagePath])
      const { error } = await supabase.from('student_confidential_docs').delete().eq('id', doc.id)
      if (error) return { ok: false, error: error.message }
      return { ok: true }
    }
  }
  await idbDelete(doc.id)
  writeLocalMeta(readLocalMeta().filter((d) => d.id !== doc.id))
  return { ok: true }
}

/** Open a private document via signed URL (cloud) or object URL (local vault). */
export async function openConfidentialDoc(
  doc: ConfidentialDocument,
): Promise<{ ok: true; url: string; revoke?: () => void } | { ok: false; error: string }> {
  if (doc.storage === 'cloud') {
    const supabase = getSupabase()
    if (!supabase) return { ok: false, error: 'Secure storage unavailable.' }
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storagePath, 120)
    if (error || !data?.signedUrl) {
      return { ok: false, error: error?.message || 'Could not open private file.' }
    }
    return { ok: true, url: data.signedUrl }
  }
  const blob = await idbGet(doc.id)
  if (!blob) return { ok: false, error: 'File not found in local vault.' }
  const url = URL.createObjectURL(blob)
  return { ok: true, url, revoke: () => URL.revokeObjectURL(url) }
}
