import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const COCKTAIL_SORT: ISortingAlgorithm = {
  id: 'cocktail',
  implementationDate: '2018-10-05',
  isStable: true,
  timeComplexity: complexity.root(
    complexity.bigOmega('n'),
    complexity.bigO(complexity.pow('n', 2)),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO(1),
  ),
  sort(sarray: SortableArray) {
    let ordered = false

    while (!ordered) {
      ordered = true

      for (let i = 1; i < sarray.getLength(); i++) {
        const current = sarray.get(i - 1) <= sarray.get(i)
        ordered = ordered && current
        sarray.recordComparison(i - 1, i, !current)
      }

      if (ordered) {
        break
      }

      ordered = true

      for (let i = sarray.getLength() - 1; i > 0; i--) {
        const current = sarray.get(i - 1) <= sarray.get(i)
        ordered = ordered && current
        sarray.recordComparison(i - 1, i, !current)
      }
    }
  },
}
