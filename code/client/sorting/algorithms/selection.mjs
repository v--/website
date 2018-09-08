export default Object.freeze({
  name: 'Selection sort',
  date: '2014-11-13',
  stable: false,
  time: 'Θ(n²)',
  space: 'Θ(1)',
  implementation (sortable) {
    for (let i = 0; i < sortable.length - 1; i++) {
      let min = i

      for (let j = i; j < sortable.length; j++) {
        sortable.update(i, j, false)

        if (sortable.get(j) < sortable.get(min)) {
          min = j
        }
      }

      sortable.update(min, i, min !== i)
    }
  }
})
