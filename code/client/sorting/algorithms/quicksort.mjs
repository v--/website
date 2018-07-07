export default Object.freeze({
  name: 'Quicksort',
  stable: false,
  time: 'O(n²)',
  space: 'O(n)',
  implementation (sortable) {
    function partition (lower, upper) {
      const pivotIndex = lower + Math.floor(Math.random() * (upper - lower))
      const pivot = sortable.get(pivotIndex)
      let p = lower

      sortable.swap(pivotIndex, upper)

      for (let i = lower; i < upper; i++) {
        if (sortable.get(i) < pivot) {
          sortable.swap(i, p++)
        } else {
          sortable.tint(i, p)
        }
      }

      sortable.swap(p, upper)
      return p
    }

    function quicksort (lower, upper) {
      const pivotIndex = partition(lower, upper)

      if (lower < pivotIndex) {
        quicksort(lower, pivotIndex)
      }

      if (upper > pivotIndex + 1) {
        quicksort(pivotIndex + 1, upper)
      }
    }

    quicksort(0, sortable.n - 1)
  }
})
