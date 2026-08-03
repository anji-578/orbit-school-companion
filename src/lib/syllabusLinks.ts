import type { SyllabusChapter, SyllabusSubtopic } from '../types'

/** Curated lesson videos for demo / fallback when teacher has not set a URL. */
const CURATED_YOUTUBE: Record<string, string> = {
  st_m1: 'https://www.youtube.com/watch?v=Wv6Yc6mYj9A',
  st_m2: 'https://www.youtube.com/watch?v=Rp6r8jQb5kE',
  st_m3: 'https://www.youtube.com/watch?v=1c5HY3z4k8I',
  st_m4: 'https://www.youtube.com/watch?v=Urc31S2LmAk',
  st_m5: 'https://www.youtube.com/watch?v=uE-1RPDqJAY',
  st_m6: 'https://www.youtube.com/watch?v=emR0g1Wb2XQ',
  st_m7: 'https://www.youtube.com/watch?v=hT0aewykFr0',
  st_s1: 'https://www.youtube.com/watch?v=uIxAhdtrXJY',
  st_s2: 'https://www.youtube.com/watch?v=sQK3Yr4SkEk',
  st_s3: 'https://www.youtube.com/watch?v=D1Ymc311XS8',
  st_s4: 'https://www.youtube.com/watch?v=g78utcLQrNg',
  st_c1: 'https://www.youtube.com/watch?v=i-Ct4q5QZ4w',
  st_c2: 'https://www.youtube.com/watch?v=UL1jmJaUkaQ',
  st_c3: 'https://www.youtube.com/watch?v=lQ6Fkf0OW1c',
  st_c4: 'https://www.youtube.com/watch?v=eNsVaUCzvLA',
  st_e1: 'https://www.youtube.com/watch?v=nwIKGqg1z9E',
  st_e2: 'https://www.youtube.com/watch?v=4jGGxJ5mPbg',
  st_e3: 'https://www.youtube.com/watch?v=7E_1oH1wL8E',
}

export function youtubeSearchUrl(topic: string, subject?: string): string {
  const q = [topic, subject, 'explained', 'class'].filter(Boolean).join(' ')
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
}

export function resolveYoutubeUrl(
  sub: Pick<SyllabusSubtopic, 'id' | 'title' | 'youtubeUrl'>,
  subject?: string,
): string {
  if (sub.youtubeUrl?.trim()) return sub.youtubeUrl.trim()
  return CURATED_YOUTUBE[sub.id] || youtubeSearchUrl(sub.title, subject)
}

export function buildRevisionDataUrl(title: string, subject?: string): string {
  const body = [
    `Summary revision · ${title}`,
    subject ? `Subject: ${subject}` : '',
    '',
    '1. Recall the core idea in one sentence.',
    '2. Write 3 key terms and their meanings.',
    '3. Solve one worked example from class notes.',
    '4. Attempt 2 practice questions without looking.',
    '5. Mark anything still unclear for Orbit AI / your teacher.',
    '',
    'Tip: 10–15 focused minutes beats a long passive reread.',
  ]
    .filter(Boolean)
    .join('\n')
  return `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`
}

export function resolveRevisionNotes(
  sub: Pick<SyllabusSubtopic, 'id' | 'title' | 'revisionNotesUrl' | 'revisionNotesName'>,
  subject?: string,
): { url: string; name: string } {
  if (sub.revisionNotesUrl?.trim()) {
    return {
      url: sub.revisionNotesUrl.trim(),
      name: sub.revisionNotesName || `${sub.title} · revision.txt`,
    }
  }
  return {
    url: buildRevisionDataUrl(sub.title, subject),
    name: `${sub.title.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 36)}-revision.txt`,
  }
}

/** Enrich chapters that lack youtube/revision fields (older cloud JSON). */
export function withSyllabusLearningLinks(chapters: SyllabusChapter[]): SyllabusChapter[] {
  return chapters.map((ch) => ({
    ...ch,
    subtopics: ch.subtopics.map((st) => ({
      ...st,
      youtubeUrl: st.youtubeUrl || CURATED_YOUTUBE[st.id],
      revisionNotesUrl: st.revisionNotesUrl || buildRevisionDataUrl(st.title, ch.subject),
      revisionNotesName:
        st.revisionNotesName ||
        `${st.title.replace(/[/\\?%*:|"<>]/g, '-').slice(0, 36)}-revision.txt`,
    })),
  }))
}
