export function orderComparator (a, b) {
  if (a === b) {
    return 0
  }

  return a > b ? 1 : -1
}

export function inverseOrderComparator (a, b) {
  return -1 * orderComparator(a, b)
}
