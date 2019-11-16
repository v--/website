function partition (sortable, lower, upper) {
  const pivotIndex = lower + Math.floor(Math.random() * (upper - lower))
  const pivot = sortable.get(pivotIndex)
  let p = lower

  sortable.update(pivotIndex, upper, true)

  for (let i = lower; i < upper; i++) {
    if (sortable.get(i) < pivot) {
      sortable.update(i, p++, true)
    } else {
      sortable.update(i, p, false)
    }
  }

  sortable.update(p, upper, true)
  return p
}

function quicksortImpl (sortable, lower, upper) {
  const pivotIndex = partition(sortable, lower, upper)

  if (lower < pivotIndex) {
    quicksortImpl(sortable, lower, pivotIndex)
  }

  if (upper > pivotIndex + 1) {
    quicksortImpl(sortable, pivotIndex + 1, upper)
  }
}

export const quicksort = Object.freeze({
  name: 'Randomized quicksort',
  date: '2015-11-23',
  stable: false,
  time: 'O(n²)',
  space: 'O(n)',
  implementation (sortable) {
    quicksortImpl(sortable, 0, sortable.length - 1)
  }
})
