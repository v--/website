import { ALGORITHMS } from './algorithms.ts'
import { SortableArray } from './support/sortable_array.ts'
import { SortingTimeline } from './support/timeline.ts'
import { type ArrayTemplateKind, type IGlobalSortingState } from './types.ts'
import { getObjectEntries, range } from '../../common/support/iteration.ts'
import { type uint32 } from '../../common/types/numbers.ts'

export const ARRAY_SIZE = 20
export const INITIAL_ARRAYS: Record<ArrayTemplateKind, uint32[]> = {
  ascending: Array.from(range(1, ARRAY_SIZE + 1)),
  descending: Array.from(range(ARRAY_SIZE, 0, -1)),
  // This was previously shuffle(range(1, ARRAY_SIZE + 1)), but since then I came to appreciate determinism
  shuffled: [5, 17, 19, 16, 10, 11, 6, 7, 12, 8, 13, 1, 18, 15, 20, 3, 14, 4, 2, 9],
  // Ditto
  grouped: [11, 6, 1, 16, 6, 11, 11, 1, 11, 11, 6, 16, 16, 1, 1, 16, 16, 16, 6, 6],
}

export const INITIAL_MOMENT = 0
export const INITIAL_PHASE = 'unstarted'

export const MIN_ACTIONS_PER_SECOND = 1
export const MAX_ACTIONS_PER_SECOND = 100
export const DEFAULT_ACTIONS_PER_SECOND = 30

export const INITIAL_GLOBAL_STATE: IGlobalSortingState = {
  speed: DEFAULT_ACTIONS_PER_SECOND,
  ...Object.fromEntries(
    ALGORITHMS.map(alg => [`moment_${alg.id}`, INITIAL_MOMENT]),
  ),
  ...Object.fromEntries(
    ALGORITHMS.map(alg => [`phase_${alg.id}`, INITIAL_PHASE]),
  ),
}

export const TIMELINES = Object.fromEntries(
  ALGORITHMS.map(function (algorithm) {
    const algorithmTimelines = Object.fromEntries(
      getObjectEntries(INITIAL_ARRAYS).map(function ([templateKind, array]) {
        const sortable = new SortableArray(array)
        algorithm.sort(sortable)
        const timeline = new SortingTimeline(array, sortable.actions)

        return [templateKind, timeline]
      }),
    ) as Record<ArrayTemplateKind, SortingTimeline>

    return [algorithm.id, algorithmTimelines]
  }),
)
