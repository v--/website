import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const SHELLSORT: ISortingAlgorithm = {
  id: 'shellsort',
  implementationDate: '2014-11-13',
  isStable: false,
  timeComplexity: complexity.root(
    complexity.bigOmega(complexity.logLinear('n')),
    complexity.bigO(complexity.pow('n', 2)),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO(1),
  ),
  sort(sarray: SortableArray) {
    const largestGap = Math.pow(2, Math.floor(Math.log2(sarray.getLength())))

    for (let gap = largestGap; gap >= 1; gap /= 2) {
      for (let i = gap; i < sarray.getLength(); i++) {
        const pivot = sarray.get(i)
        let j = i

        for (; j >= gap && sarray.get(j - gap) > pivot; j -= gap) {
          sarray.recordComparison(j - gap, j, true)
        }

        sarray.recordComparison(j - gap, j, false)
      }
    }
  },
}
