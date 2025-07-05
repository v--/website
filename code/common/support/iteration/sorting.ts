import { type float64 } from '../../types/numbers.ts'
import { type Mapper } from '../../types/typecons.ts'

type ComparatorResult = -1 | 0 | 1

export function orderComparator<T>(a: T, b: T): ComparatorResult {
  if (a === b) {
    return 0
  }

  return a > b ? 1 : -1
}

export function inverseOrderComparator<T>(a: T, b: T): ComparatorResult {
  return -1 * orderComparator(a, b) as ComparatorResult
}

export function sort<T>(iter: Iterable<T>, ascending: boolean = true): T[] {
  const array = Array.from(iter)

  if (ascending) {
    return array.sort(orderComparator)
  }

  return array.sort(inverseOrderComparator)
}

export function schwartzSort<T>(transform: Mapper<T, string | float64>, iterable: Iterable<T>): T[] {
  const array = Array.from(iterable)

  const values = new Map<T, string | float64>(
    array.map(x => [x, transform(x)]),
  )

  return array.sort((a, b) => orderComparator(values.get(a), values.get(b)))
}

export function shuffle<T>(iterable: Iterable<T>): T[] {
  const array = Array.from(iterable)
  const n = array.length

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (n - i))
    const temp = array[j]
    array[j] = array[i]
    array[i] = temp
  }

  return array
}
