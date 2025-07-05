import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const INSERTION_SORT: ISortingAlgorithm = {
  id: 'insertion',
  implementationDate: '2014-11-13',
  isStable: true,
  timeComplexity: complexity.root(
    complexity.bigOmega('n'),
    complexity.bigO(complexity.pow('n', 2)),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO(1),
  ),
  sort(sarray: SortableArray) {
    for (let i = 1; i < sarray.getLength(); i++) {
      for (let j = i; j > 0; j--) {
        const swap = sarray.get(j - 1) > sarray.get(j)
        sarray.recordComparison(j - 1, j, swap)

        if (!swap) {
          break
        }
      }
    }
  },
}
