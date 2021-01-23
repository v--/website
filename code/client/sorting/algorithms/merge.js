import { ActionList } from '../support/action_list.js'

/**
 * @param {TCons.NonStrictMap<TNum.UInt32, TNum.UInt32>} map
 * @param {TNum.UInt32} src
 * @param {TNum.UInt32} dest
 */
function updateIndexMap(map, src, dest) {
  let ind = dest

  while (map.has(ind)) {
    ind = map.get(ind)
  }

  map.set(src, ind)
}

/** @type {TSortVis.ISortAlgorithm} */
export const mergeSort = Object.freeze({
  name: 'Bottom-up merge sort',
  date: '2014-11-13',
  stable: true,
  time: 'Θ(n log n)',
  space: 'O(n)',
  /** @param {ActionList} sortable */
  implementation(sortable) {
    const n = sortable.length

    for (let span = 1; span < n; span *= 2) {
      for (let start = 0; start < n; start += 2 * span) {
        const indexMap = new Map()

        const middle = Math.min(start + span, n)
        const end = Math.min(start + 2 * span, n)

        let left = start
        let right = middle

        for (let i = start; i < end; i++) {
          if (left < middle && (end === right || sortable.get(left) < sortable.get(right))) {
            updateIndexMap(indexMap, i, left)
            left++
          } else {
            updateIndexMap(indexMap, i, right)
            right++
          }
        }

        for (let i = start; i < end; i++) {
          const newI = indexMap.get(i)
          sortable.update(i, newI, i !== newI)
        }
      }
    }
  }
})
