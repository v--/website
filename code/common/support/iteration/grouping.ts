import { type uint32 } from '../../types/numbers.ts'
import { type Mapper } from '../../types/typecons.ts'

export function* uniqueBy<T, S>(iter: Iterable<T>, key?: Mapper<T, S>): Generator<T> {
  const values = Array.from(iter)

  const set = new Set<T | S>()

  for (const value of values) {
    const k = key ? key(value) : value

    if (!set.has(k)) {
      set.add(k)
      yield value
    }
  }
}

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

export function counter<T>(iterable: Iterable<T>): Map<T, uint32> {
  const counter = new Map<T, uint32>()

  for (const value of iterable) {
    if (counter.has(value)) {
      counter.set(value, counter.get(value)! + 1)
    } else {
      counter.set(value, 1)
    }
  }

  return counter
}
