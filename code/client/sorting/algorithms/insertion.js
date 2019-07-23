export default Object.freeze({
  name: 'Insertion sort',
  date: '2014-11-13',
  stable: true,
  time: 'O(n²)',
  space: 'Θ(1)',
  implementation (sortable) {
    for (let i = 1; i < sortable.length; i++) {
      for (let j = i; j > 0; j--) {
        sortable.update(j - 1, j, sortable.get(j - 1) > sortable.get(j))
      }
    }
  }
})
