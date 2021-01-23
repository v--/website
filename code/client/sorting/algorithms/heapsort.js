import { ActionList } from '../support/action_list.js'

/**
 * The procedure is much simpler, but maintaining the action list requires a lot of conditional logic
 * @param {ActionList} sortable
 * @param {TNum.UInt32} start
 * @param {TNum.UInt32} end
 */
function siftDown(sortable, start, end) {
  let root = start
  let leftChild = 2 * root + 1
  let rightChild = 2 * root + 2

  while (leftChild <= end) {
    if (sortable.get(root) < sortable.get(leftChild)) {
      if (rightChild <= end) {
        if (sortable.get(leftChild) < sortable.get(rightChild)) {
          sortable.update(root, leftChild, false)
          sortable.update(root, rightChild, true)
          root = rightChild
        } else {
          sortable.update(root, leftChild, true)
          sortable.update(leftChild, rightChild, false)
          root = leftChild
        }
      } else {
        sortable.update(root, leftChild, true)
        root = leftChild
      }
    } else {
      sortable.update(root, leftChild, false)

      if (rightChild <= end) {
        if (sortable.get(root) < sortable.get(rightChild)) {
          sortable.update(root, rightChild, true)
          root = rightChild
        } else {
          sortable.update(root, rightChild, false)
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

/** @param {ActionList} sortable */
function heapify(sortable) {
  const end = sortable.length - 1
  const parent = Math.ceil(end / 2) - 1

  for (let start = parent; start >= 0; start--) {
    siftDown(sortable, start, end)
  }
}

/** @type {TSortVis.ISortAlgorithm} */
export const heapsort = Object.freeze({
  name: 'Heapsort',
  date: '2015-11-23',
  stable: false,
  time: 'Ω(n), O(n log n)',
  space: 'O(1)',
  /** @param {ActionList} sortable */
  implementation(sortable) {
    heapify(sortable)

    for (let end = sortable.length - 1; end >= 0; end--) {
      // Put largest element at the end
      sortable.update(0, end, true)
      // Repair heap
      siftDown(sortable, 0, end - 1)
    }
  }
})
