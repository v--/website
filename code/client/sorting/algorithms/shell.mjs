export default Object.freeze({
  name: 'Shellsort',
  date: '13 November 2014',
  stable: false,
  time: 'O(n²)',
  space: 'Θ(1)',
  implementation (sortable) {
    for (let gap = Math.pow(2, Math.floor(Math.log2(sortable.length))); gap >= 1; gap /= 2) {
      for (let i = gap; i < sortable.length; i++) {
        let j = i
        let swappable = i

        while (j >= gap) {
          const a = j
          const b = j - gap
          const swap = sortable.get(b) > sortable.get(swappable)
          sortable.update(a, b, swap)

          if (swap) {
            if (swappable === b) swappable = a
            if (swappable === a) swappable = b
          } else {
            break
          }

          j -= gap
        }

        sortable.update(j, swappable, true)
      }
    }
  }
})
