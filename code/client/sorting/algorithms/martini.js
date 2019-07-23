export default Object.freeze({
  name: 'Martini sort',
  date: '2018-10-05',
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

      if (ordered) {
        break
      }

      ordered = true

      for (let i = sortable.length - 1; i > 0; i--) {
        const current = sortable.get(i - 1) <= sortable.get(i)
        ordered &= current
        sortable.update(i - 1, i, !current)
      }
    }
  }
})
