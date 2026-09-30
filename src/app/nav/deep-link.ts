import {
  DESTINATION_TITLES,
  tabForDestination,
  type StudentDestination,
  type StudentNavParams,
} from '../../features/student-app/studentNav'

export type DeepLinkResult =
  | { ok: true; dest: StudentDestination; params: StudentNavParams; title?: string }
  | { ok: false; reason: string }

/**
 * Resolve orbit://<dest>?subject=&taskId=&section= (and https app-link path /d/<dest>).
 * Unknown destinations fall back safely (ok:false).
 */
export function resolveOrbitDeepLink(raw: string): DeepLinkResult {
  try {
    let url: URL
    if (raw.startsWith('orbit://')) {
      url = new URL(raw.replace('orbit://', 'https://orbit.local/'))
    } else if (raw.startsWith('/d/')) {
      url = new URL(raw, 'https://orbit.local')
    } else {
      url = new URL(raw)
    }
    const parts = url.pathname.replace(/^\//, '').split('/').filter(Boolean)
    const destPart = parts[0] === 'd' ? parts[1] : parts[0]
    if (!destPart || !(destPart in DESTINATION_TITLES)) {
      return { ok: false, reason: 'unknown_destination' }
    }
    const dest = destPart as StudentDestination
    void tabForDestination(dest)
    const params: StudentNavParams = {}
    const subject = url.searchParams.get('subject')
    const taskId = url.searchParams.get('taskId')
    const section = url.searchParams.get('section')
    if (subject) params.subject = subject
    if (taskId) params.taskId = taskId
    if (
      section === 'topics' ||
      section === 'homework' ||
      section === 'assessments' ||
      section === 'resources' ||
      section === 'progress'
    ) {
      params.section = section
    }
    return { ok: true, dest, params, title: DESTINATION_TITLES[dest] }
  } catch {
    return { ok: false, reason: 'parse_error' }
  }
}
