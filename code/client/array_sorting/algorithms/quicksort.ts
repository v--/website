import { type uint32 } from '../../../common/types/numbers.ts'
import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const QUICKSORT: ISortingAlgorithm = {
  id: 'quicksort',
  implementationDate: '2015-11-23',
  isStable: false,
  timeComplexity: complexity.root(
    complexity.bigOmega(complexity.logLinear('n')),
    complexity.bigO(complexity.pow('n', 2)),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO('n'),
  ),
  sort(sarray: SortableArray) {
    recurse(sarray, 0, sarray.getLength() - 1)
  },
}

function partition(sarray: SortableArray, start: uint32, end: uint32) {
  const pivotIndex = Math.floor((start + end) / 2)
  const pivot = sarray.get(pivotIndex)
  let newPivotIndex = start

  // Move the upmost element into the traversable part of the array and store the pivot index there
  sarray.recordComparison(pivotIndex, end, true)

  // The last item that contains the pivot is not reached
  for (let i = start; i < end; i++) {
    if (sarray.get(i) < pivot) {
      sarray.recordComparison(i, newPivotIndex, i !== newPivotIndex)
      newPivotIndex++
    } else {
      sarray.recordComparison(i, newPivotIndex, false)
    }
  }

  // Put the pivot into it's actual place
  sarray.recordComparison(newPivotIndex, end, newPivotIndex !== end)
  return newPivotIndex
}

function recurse(sarray: SortableArray, start: uint32, end: uint32) {
  const pivotIndex = partition(sarray, start, end)

  if (start < pivotIndex) {
    recurse(sarray, start, pivotIndex - 1)
  }

  if (end > pivotIndex) {
    recurse(sarray, pivotIndex + 1, end)
  }
}
