import { SortAlgorithm } from '../types/sort_algorithm.js'
import { ActionList } from '../support/action_list.js'

function updateIndexMap(map: TCons.NonStrictMap<TNum.UInt32, TNum.UInt32>, src: TNum.UInt32, dest: TNum.UInt32) {
  let ind = dest

  while (map.has(ind)) {
    ind = map.get(ind)
  }

  map.set(src, ind)
}

export const mergeSort: SortAlgorithm = Object.freeze({
  name: 'Bottom-up merge sort',
  date: '2014-11-13',
  stable: true,
  time: 'Θ(n log n)',
  space: 'O(n)',
  implementation(sortable: ActionList) {
    const n = sortable.length

    for (let span = 1; span < n; span *= 2) {
      for (let start = 0; start < n; start += 2 * span) {
        const indexMap = new Map()

        const middle = Math.min(start + span, n)
        const end = Math.min(start + 2 * span, n)

        let left = start
        let right = middle

        for (let i = start; i < end; i++) {
          if (left < middle && (end === right || sortable.get(left) < sortable.get(right))) {
            updateIndexMap(indexMap, i, left)
            left++
          } else {
            updateIndexMap(indexMap, i, right)
            right++
          }
        }

        for (let i = start; i < end; i++) {
          const newI = indexMap.get(i)
          sortable.update(i, newI, i !== newI)
        }
      }
    }
  }
})
