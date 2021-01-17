/**
 * @template T
 * @param {T} a
 * @param {T} b
 */
export function orderComparator(a, b) {
  if (a === b) {
    return 0
  }

  return a > b ? 1 : -1
}

/**
 * @template T
 * @param {T} a
 * @param {T} b
 */
export function inverseOrderComparator(a, b) {
  return -1 * orderComparator(a, b)
}
