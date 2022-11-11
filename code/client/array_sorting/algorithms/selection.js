import { ActionList } from '../support/action_list.js'

/** @type {TArraySorting.ISortAlgorithm} */
export const selectionSort = Object.freeze({
  name: 'Selection sort',
  date: '2014-11-13',
  stable: false,
  time: 'Θ(n²)',
  space: 'O(1)',
  /** @param {ActionList} sortable */
  implementation(sortable) {
    for (let i = 0; i < sortable.length - 1; i++) {
      let min = i

      for (let j = i; j < sortable.length; j++) {
        if (sortable.get(j) < sortable.get(min)) {
          sortable.update(i, min, false)
          min = j
        } else {
          sortable.update(i, j, false)
        }
      }

      sortable.update(min, i, min !== i)
    }
  }
})
