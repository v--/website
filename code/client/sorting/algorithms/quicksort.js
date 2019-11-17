import { randInt } from '../../../common/math/prob/random.js'

function partition (sortable, start, end) {
  const pivotIndex = randInt(start, end)
  const pivot = sortable.get(pivotIndex)
  let newPivotIndex = start

  // Move the upmost element into the traversable part of the array and store the pivot index there
  sortable.update(pivotIndex, end, true)

  // The last item that contains the pivot is not reached
  for (let i = start; i < end; i++) {
    if (sortable.get(i) < pivot) {
      sortable.update(i, newPivotIndex, i !== newPivotIndex)
      newPivotIndex++
    } else {
      sortable.update(i, newPivotIndex, false)
    }
  }

  // Put the pivot into it's actual place
  sortable.update(newPivotIndex, end, newPivotIndex !== end)
  return newPivotIndex
}

function sort (sortable, start, end) {
  const pivotIndex = partition(sortable, start, end)

  if (start < pivotIndex) {
    sort(sortable, start, pivotIndex - 1)
  }

  if (end > pivotIndex) {
    sort(sortable, pivotIndex + 1, end)
  }
}

export const quicksort = Object.freeze({
  name: 'Randomized quicksort',
  date: '2015-11-23',
  stable: false,
  time: 'Ω(n log n), O(n²)',
  space: 'O(log n)',
  implementation (sortable) {
    sort(sortable, 0, sortable.length - 1)
  }
})
