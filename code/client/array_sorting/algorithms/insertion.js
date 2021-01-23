import { ActionList } from '../support/action_list.js'

/** @type {TArraySorting.ISortAlgorithm} */
export const insertionSort = Object.freeze({
  name: 'Insertion sort',
  date: '2014-11-13',
  stable: true,
  time: 'Ω(n), O(n²)',
  space: 'O(1)',
  /** @param {ActionList} sortable */
  implementation(sortable) {
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
