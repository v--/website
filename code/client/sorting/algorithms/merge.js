export const mergeSort = Object.freeze({
  name: 'Bottom-up merge sort',
  date: '2014-11-13',
  stable: true,
  time: 'O(n log n)',
  space: 'O(n)',
  implementation (sortable) {
    const buffer = []
    const n = sortable.length

    for (let span = 1; span < n; span *= 2) {
      for (let start = 0; start < n; start += 2 * span) {
        const middle = Math.min(start + span, n)
        const end = Math.min(start + 2 * span, n)

        let left = start
        let right = middle

        for (let i = start; i < end; i++) {
          if (left < middle && (end === right || sortable.get(left) < sortable.get(right))) {
            buffer[i] = sortable.get(left++)
          } else {
            buffer[i] = sortable.get(right++)
          }
        }

        for (let i = start; i < end; i++) {
          const index = sortable.indexOf(buffer[i])
          sortable.update(index, i, true)
        }
      }
    }
  }
})
