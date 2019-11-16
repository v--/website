export const bubbleSort = Object.freeze({
  name: 'Bubble sort',
  date: '2014-11-13',
  stable: true,
  time: 'O(n²)',
  space: 'Θ(1)',
  implementation (sortable) {
    let ordered = false

    while (!ordered) {
      ordered = true

      for (let i = 1; i < sortable.length; i++) {
        const current = sortable.get(i - 1) <= sortable.get(i)
        ordered &= current
        sortable.update(i - 1, i, !current)
      }
    }
  }
})
