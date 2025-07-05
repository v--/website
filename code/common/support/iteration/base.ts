import { type float64, type int32, type uint32 } from '../../types/numbers.ts'

export const EMPTY: Iterable<never> = []

export function range(from: uint32, to?: uint32, step?: uint32): Generator<uint32>
export function range(from: int32, to?: int32, step?: int32): Generator<int32>
export function range(from: float64, to?: float64, step?: float64): Generator<float64>
export function* range(from: float64, to?: float64, step: float64 = 1): Generator<float64> {
  const sign = Math.sign(step)

  if (to === undefined) {
    to = from
    from = 0
  }

  for (let i = from; sign * i < sign * to; i = i + step) {
    yield i
  }
}

export function* padLeft<T>(iterable: Iterable<T>, size: uint32, padWith: T): Generator<T> {
  const values = Array.from(iterable)

  for (let i = values.length; i < size; i++) {
    yield padWith
  }

  yield* values
}

export function* padRight<T>(iterable: Iterable<T>, size: uint32, padWith: T): Generator<T> {
  let counter = 0

  for (const value of iterable) {
    counter++
    yield value
  }

  for (let i = counter; i < size; i++) {
    yield padWith
  }
}

export function swap<T>(array: T[], i: uint32, j: uint32) {
  const tmp = array[i]
  array[i] = array[j]
  array[j] = tmp
}

export function* cumulative<T>(iterable: Iterable<T>): Generator<T[]> {
  const payload: T[] = []

  for (const value of iterable) {
    payload.push(value)
    yield payload.slice()
  }
}

export function* enumerate<T>(iterable: Iterable<T>): Generator<[uint32, T]> {
  let i = 0

  for (const value of iterable) {
    yield [i++, value]
  }
}

export function reversed<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable).reverse()
}

export function* intersperse<T>(iterable: Iterable<T>, conjunction: T, lastConjunction: T = conjunction) {
  const values = Array.from(iterable)

  for (let i = 0; i < values.length; i++) {
    yield values[i]

    if (i + 2 < values.length) {
      yield conjunction
    } else if (i + 2 == values.length) {
      yield lastConjunction
    }
  }
}

/**
 * A better-typed wrapper around Object#entries
 */
export function getObjectEntries<T extends object>(object: T) {
  return Object.entries(object) as Array<[keyof T, T[keyof T]]>
}

/**
 * A better-typed wrapper around Array#includes
 */
export function includes<T>(array: Array<T> | ReadonlyArray<T>, value: unknown): value is T {
  return array.includes(value as T)
}
