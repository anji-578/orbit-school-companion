import { getSupabase, isSupabaseConfigured } from './supabase'
import { resolveClassLabel, resolveSchoolId } from './schoolPolicy'
import type { SyllabusChapter } from '../types'
import { initialCurriculum } from '../data/demo'

const BUCKET = 'syllabus-notes'


function isRemoteNoteUrl(url?: string) {
  return Boolean(url && (url.startsWith('http://') || url.startsWith('https://')))
}

/** Strip local data-URL blobs; keep Storage public URLs for multi-device. */
export function curriculumForCloud(chapters: SyllabusChapter[]): SyllabusChapter[] {
  return chapters.map((ch) => ({
    ...ch,
    subtopics: ch.subtopics.map((st) => ({
      ...st,
      noteDataUrl: isRemoteNoteUrl(st.noteDataUrl) ? st.noteDataUrl : undefined,
    })),
  }))
}

/** Merge remote progress + remote note URLs with any local preview blobs. */
export function mergeCurriculum(
  remote: SyllabusChapter[] | null | undefined,
  local: SyllabusChapter[],
): SyllabusChapter[] {
  if (!remote?.length) return local.length ? local : initialCurriculum
  const localBySub = new Map<string, { noteDataUrl?: string; noteMime?: string; noteName?: string; noteUploadedAt?: string }>()
  for (const ch of local) {
    for (const st of ch.subtopics) {
      localBySub.set(`${ch.id}:${st.id}`, {
        noteDataUrl: st.noteDataUrl,
        noteMime: st.noteMime,
        noteName: st.noteName,
        noteUploadedAt: st.noteUploadedAt,
      })
    }
  }
  return remote.map((ch) => ({
    ...ch,
    subtopics: ch.subtopics.map((st) => {
      const localNote = localBySub.get(`${ch.id}:${st.id}`)
      const preferredUrl = isRemoteNoteUrl(st.noteDataUrl)
        ? st.noteDataUrl
        : isRemoteNoteUrl(localNote?.noteDataUrl)
          ? localNote?.noteDataUrl
          : localNote?.noteDataUrl ?? st.noteDataUrl
      return {
        ...st,
        noteDataUrl: preferredUrl,
        noteMime: st.noteMime ?? localNote?.noteMime,
        noteName: st.noteName ?? localNote?.noteName,
        noteUploadedAt: st.noteUploadedAt ?? localNote?.noteUploadedAt,
      }
    }),
  }))
}

export async function fetchSyllabusState(): Promise<SyllabusChapter[] | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  if (!supabase) return null
  const schoolId = await resolveSchoolId()
  if (!schoolId) return null
  const { data, error } = await supabase
    .from('syllabus_state')
    .select('curriculum')
    .eq('school_id', schoolId)
    .eq('class_name', resolveClassLabel())
    .maybeSingle()
  if (error || !data) return null
  const curriculum = data.curriculum as SyllabusChapter[]
  return Array.isArray(curriculum) && curriculum.length ? curriculum : null
}

export async function saveSyllabusState(chapters: SyllabusChapter[]): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: true }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable' }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found — run seed.sql' }
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await supabase.from('syllabus_state').upsert({
    school_id: schoolId,
    class_name: resolveClassLabel(),
    curriculum: curriculumForCloud(chapters),
    updated_at: new Date().toISOString(),
    updated_by: user?.id ?? null,
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

function storagePath(schoolId: string, chapterId: string, subtopicId: string, fileName: string) {
  const safe = fileName.replace(/[^\w.\-]+/g, '_').slice(0, 80)
  return `${schoolId}/${chapterId}/${subtopicId}/${Date.now()}_${safe}`
}

export async function uploadSyllabusNoteFile(
  chapterId: string,
  subtopicId: string,
  file: File,
): Promise<{ ok: true; publicUrl: string; path: string } | { ok: false; error: string; localOnly?: true }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured', localOnly: true }
  }
  const supabase = getSupabase()
  if (!supabase) return { ok: false, error: 'Supabase unavailable', localOnly: true }
  const schoolId = await resolveSchoolId()
  if (!schoolId) return { ok: false, error: 'School not found — run seed.sql', localOnly: true }

  const path = storagePath(schoolId, chapterId, subtopicId, file.name)
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) {
    return { ok: false, error: error.message, localOnly: true }
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { ok: true, publicUrl: data.publicUrl, path }
}

export async function deleteSyllabusNoteFile(noteUrl?: string): Promise<void> {
  if (!noteUrl || !isRemoteNoteUrl(noteUrl) || !isSupabaseConfigured()) return
  const supabase = getSupabase()
  if (!supabase) return
  // public URL …/object/public/syllabus-notes/<path>
  const marker = `/object/public/${BUCKET}/`
  const idx = noteUrl.indexOf(marker)
  if (idx < 0) return
  const path = decodeURIComponent(noteUrl.slice(idx + marker.length))
  await supabase.storage.from(BUCKET).remove([path])
}
