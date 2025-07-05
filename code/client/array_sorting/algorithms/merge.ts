import { type uint32 } from '../../../common/types/numbers.ts'
import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const MERGE_SORT: ISortingAlgorithm = {
  id: 'merge',
  implementationDate: '2014-11-13',
  isStable: true,
  timeComplexity: complexity.root(
    complexity.theta(complexity.logLinear('n')),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO('n'),
  ),
  sort(sarray: SortableArray) {
    const n = sarray.getLength()

    for (let span = 1; span < n; span *= 2) {
      for (let start = 0; start < n; start += 2 * span) {
        const indexMap = new Map()

        const middle = Math.min(start + span, n)
        const end = Math.min(start + 2 * span, n)

        let left = start
        let right = middle

        for (let i = start; i < end; i++) {
          if (left < middle && (end === right || sarray.get(left) < sarray.get(right))) {
            updateIndexMap(indexMap, i, left)
            left++
          } else {
            updateIndexMap(indexMap, i, right)
            right++
          }
        }

        for (let i = start; i < end; i++) {
          const newI = indexMap.get(i)
          sarray.recordComparison(i, newI, i !== newI)
        }
      }
    }
  },
}

function updateIndexMap(map: Map<uint32, uint32>, src: uint32, dest: uint32) {
  let ind = dest

  while (map.has(ind)) {
    ind = map.get(ind)!
  }

  map.set(src, ind)
}
