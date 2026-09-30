import { useQuery } from '@tanstack/react-query'
import { useOrbitStore } from '../../../store/orbitStore'
import { mapHomeworkRows } from '../api/homework'

/**
 * Phase 3 bridge: Query key + store-backed data until repositories fully replace hydrate.
 * Screens may keep using useOrbitStore; this hook is the migration path.
 */
export function useHomeworkQuery() {
  const tasks = useOrbitStore((s) => s.tasks)
  return useQuery({
    queryKey: ['homework', 'current'],
    queryFn: async () => mapHomeworkRows(tasks),
    initialData: () => mapHomeworkRows(tasks),
    staleTime: 30_000,
  })
}
