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
  for (const regex of [/^IMG_/, /^VID_/, /^\d{4}-\d{2}-\d{2}/]) {
    if (regex.test(a) && regex.test(b)) {
      return inverseOrderComparator(a, b)
    }
  }

  return orderComparator(a, b)
}
