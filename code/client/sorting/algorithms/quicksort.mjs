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

function quicksort (sortable, lower, upper) {
  const pivotIndex = partition(sortable, lower, upper)

  if (lower < pivotIndex) {
    quicksort(sortable, lower, pivotIndex)
  }

  if (upper > pivotIndex + 1) {
    quicksort(sortable, pivotIndex + 1, upper)
  }
}

export default Object.freeze({
  name: 'Randomized quicksort',
  date: '23 November 2015',
  stable: false,
  time: 'O(n²)',
  space: 'O(n)',
  implementation (sortable) {
    quicksort(sortable, 0, sortable.length - 1)
  }
})
