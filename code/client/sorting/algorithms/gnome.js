export const gnomeSort = Object.freeze({
  name: 'Gnome sort',
  date: '2016-05-20',
  stable: true,
  time: 'O(n²)',
  space: 'Θ(1)',
  implementation (sortable) {
    for (let pos = 0; pos < sortable.length;) {
      const swap = pos !== 0 && sortable.get(pos - 1) > sortable.get(pos)
      sortable.update(Math.max(0, pos - 1), pos, swap)

      if (swap) {
        pos--
      } else {
        pos++
      }
    }
  }
})
