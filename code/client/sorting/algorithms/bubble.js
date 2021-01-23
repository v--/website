import { ActionList } from '../support/action_list.js'

/** @type {TSortVis.ISortAlgorithm} */
export const bubbleSort = Object.freeze({
  name: 'Bubble sort',
  date: '2014-11-13',
  stable: true,
  time: 'Ω(n), O(n²)',
  space: 'O(1)',
  /** @param {ActionList} sortable */
  implementation(sortable) {
    let ordered = false

    while (!ordered) {
      ordered = true

      for (let i = 1; i < sortable.length; i++) {
        const current = sortable.get(i - 1) <= sortable.get(i)
        ordered = ordered && current
        sortable.update(i - 1, i, !current)
      }
    }
  }
})
