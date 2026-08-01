/** Prefer live remote rows; keep rich local samples so every tab looks filled for demos. */
export function withSample<T>(remote: T[] | null | undefined, sample: T[]): T[] {
  return remote && remote.length > 0 ? remote : sample
}

export function timetableHasSlots(week: Record<string, { theory: unknown[]; lab: unknown[] }> | null | undefined) {
  if (!week) return false
  return Object.values(week).some((d) => (d?.theory?.length ?? 0) + (d?.lab?.length ?? 0) > 0)
}
