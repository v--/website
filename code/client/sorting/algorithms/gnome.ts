import { SortAlgorithm } from '../types/sort_algorithm.js'
import { ActionList } from '../support/action_list.js'

export const gnomeSort: SortAlgorithm = Object.freeze({
  name: 'Gnome sort',
  date: '2016-05-20',
  stable: true,
  time: 'Ω(n), O(n²)',
  space: 'O(1)',
  implementation(sortable: ActionList) {
    for (let pos = 1; pos < sortable.length;) {
      const swap = pos !== 0 && sortable.get(pos - 1) > sortable.get(pos)
      sortable.update(Math.max(0, pos - 1), pos, swap)

      if (swap) {
        pos--
      } else {
        pos++
      }
    }
  }
})
