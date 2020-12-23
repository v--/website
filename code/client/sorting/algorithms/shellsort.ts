import { SortAlgorithm } from '../types/sort_algorithm.js'
import { ActionList } from '../support/action_list.js'

export const shellsort: SortAlgorithm = Object.freeze({
  name: 'Shellsort',
  date: '2014-11-13',
  stable: false,
  time: 'Ω(n log n), O(n²)',
  space: 'O(1)',
  implementation(sortable: ActionList) {
    const largestGap = Math.pow(2, Math.floor(Math.log2(sortable.length)))

    for (let gap = largestGap; gap >= 1; gap /= 2) {
      for (let i = gap; i < sortable.length; i++) {
        const pivot = sortable.get(i)
        let j = i

        for (; j >= gap && sortable.get(j - gap) > pivot; j -= gap) {
          sortable.update(j - gap, j, true)
        }

        sortable.update(j - gap, j, false)
      }
    }
  }
})
