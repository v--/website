import { SortAlgorithm } from '../types/sort_algorithm.js'
import { ActionList } from '../support/action_list.js'

export const insertionSort: SortAlgorithm = Object.freeze({
  name: 'Insertion sort',
  date: '2014-11-13',
  stable: true,
  time: 'Ω(n), O(n²)',
  space: 'O(1)',
  implementation(sortable: ActionList) {
    for (let i = 1; i < sortable.length; i++) {
      for (let j = i; j > 0; j--) {
        const swap = sortable.get(j - 1) > sortable.get(j)
        sortable.update(j - 1, j, swap)

        if (!swap) {
          break
        }
      }
    }
  }
})
