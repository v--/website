import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const SELECTION_SORT: ISortingAlgorithm = {
  id: 'selection',
  implementationDate: '2014-11-13',
  isStable: false,
  timeComplexity: complexity.root(
    complexity.theta(complexity.pow('n', 2)),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO(1),
  ),
  sort(sarray: SortableArray) {
    for (let i = 0; i < sarray.getLength() - 1; i++) {
      let min = i

      for (let j = i + 1; j < sarray.getLength(); j++) {
        if (sarray.get(j) < sarray.get(min)) {
          sarray.recordComparison(i, min, false)
          min = j
        } else {
          sarray.recordComparison(i, j, false)
        }
      }

      sarray.recordComparison(min, i, min !== i)
    }
  },
}
