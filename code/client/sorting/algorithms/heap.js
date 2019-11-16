function immediateLargest (sortable, heapSize, i) {
  return [i, 2 * i + 1, 2 * i + 2]
    .filter(x => x < heapSize)
    .reduce(function (x, payload) {
      return sortable.get(x) >= sortable.get(payload) ? x : payload
    }) // Max by sortable.get(x)
}

function constructHeap (sortable, heapSize, largest, candidateLargest) {
  do {
    sortable.update(largest, candidateLargest, largest !== candidateLargest)
    largest = candidateLargest
    candidateLargest = immediateLargest(sortable, heapSize, largest)
  } while (largest !== candidateLargest)
}

export const heapsort = Object.freeze({
  name: 'Heapsort',
  date: '2015-11-23',
  stable: false,
  time: 'O(n log n)',
  space: 'Θ(1)',
  implementation (sortable) {
    const n = sortable.length

    for (let i = Math.floor(n / 2); i >= 0; --i) {
      constructHeap(sortable, n, i, i)
    }

    for (let i = n - 1; i >= 1; --i) {
      constructHeap(sortable, i, i, 0)
    }
  }
})
