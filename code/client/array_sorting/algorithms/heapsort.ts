import { type uint32 } from '../../../common/types/numbers.ts'
import { complexity } from '../support/complexity.ts'
import { type SortableArray } from '../support/sortable_array.ts'
import { type ISortingAlgorithm } from '../types.ts'

export const HEAPSORT: ISortingAlgorithm = {
  id: 'heapsort',
  implementationDate: '2015-11-23',
  isStable: false,
  timeComplexity: complexity.root(
    complexity.theta(complexity.logLinear('n')),
  ),
  spaceComplexity: complexity.root(
    complexity.bigO(1),
  ),
  sort(sarray: SortableArray) {
    heapify(sarray)

    for (let end = sarray.getLength() - 1; end >= 0; end--) {
      // Put largest element at the end
      sarray.recordComparison(0, end, true)
      // Repair heap
      siftDown(sarray, 0, end - 1)
    }
  },
}

function siftDown(sarray: SortableArray, start: uint32, end: uint32) {
  let root = start
  let leftChild = 2 * root + 1
  let rightChild = 2 * root + 2

  while (leftChild <= end) {
    if (sarray.get(root) < sarray.get(leftChild)) {
      if (rightChild <= end) {
        if (sarray.get(leftChild) < sarray.get(rightChild)) {
          sarray.recordComparison(root, leftChild, false)
          sarray.recordComparison(root, rightChild, true)
          root = rightChild
        } else {
          sarray.recordComparison(root, leftChild, true)
          sarray.recordComparison(leftChild, rightChild, false)
          root = leftChild
        }
      } else {
        sarray.recordComparison(root, leftChild, true)
        root = leftChild
      }
    } else {
      sarray.recordComparison(root, leftChild, false)

      if (rightChild <= end) {
        if (sarray.get(root) < sarray.get(rightChild)) {
          sarray.recordComparison(root, rightChild, true)
          root = rightChild
        } else {
          sarray.recordComparison(root, rightChild, false)
          return
        }
      } else {
        return
      }
    }

    leftChild = 2 * root + 1
    rightChild = 2 * root + 2
  }
}

function heapify(sarray: SortableArray) {
  const end = sarray.getLength() - 1
  const parent = Math.ceil(end / 2) - 1

  for (let start = parent; start >= 0; start--) {
    siftDown(sarray, start, end)
  }
}
