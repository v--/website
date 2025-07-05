import { type Mapper } from '../../types/typecons.ts'

export function groupBy<T, S>(iter: Iterable<T>, key: Mapper<T, S>): Map<S, T[]> {
  const values = Array.from(iter)
  const map = new Map<S, T[]>()

  for (const value of values) {
    const k = key(value)

    if (!map.has(k)) {
      map.set(k, [value])
    } else {
      map.get(k)!.push(value)
    }
  }

  return map
}
