export function orderComparator<T>(a: T, b: T) {
  if (a === b) {
    return 0
  }

  return a > b ? 1 : -1
}

export function inverseOrderComparator<T>(a: T, b: T) {
  return -1 * orderComparator(a, b)
}
