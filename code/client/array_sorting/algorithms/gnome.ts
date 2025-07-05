import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const GNOME_SORT: ISortingAlgorithm = {
  id: 'gnome',
  implementationDate: '2016-05-20',
  isStable: true,
  timeComplexity: complexity.root(
    complexity.bigOmega('n'),
    complexity.bigO(complexity.pow('n', 2)),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO(1),
  ),
  sort(sarray: SortableArray) {
    for (let pos = 1; pos < sarray.getLength();) {
      const swap = pos !== 0 && sarray.get(pos - 1) > sarray.get(pos)
      sarray.recordComparison(Math.max(0, pos - 1), pos, swap)

      if (swap) {
        pos--
      } else {
        pos++
      }
    }
  },
}
