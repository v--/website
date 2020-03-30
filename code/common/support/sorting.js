export function orderComparator (a, b) {
  if (a === b) {
    return 0
  }

  return a > b ? 1 : -1
}

export function inverseOrderComparator (a, b) {
  return -1 * orderComparator(a, b)
}

export function imageSortingComparator (a, b) {
  if (a.match(/\d{4}/) && b.match(/\d{4}/)) {
    return inverseOrderComparator(a, b)
  }

  return orderComparator(a, b)
}
