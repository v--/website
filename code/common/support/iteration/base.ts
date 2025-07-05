import { type float64, type int32, type uint32 } from '../../types/numbers.ts'
import { type FlattenIterableType, type IterBase, type Mapper, type Predicate, type Reducer } from '../../types/typecons.ts'

// TODO: I should remove this at some point
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/every
export function all<T>(predicate: Predicate<T>, iter: Iterable<T>): boolean {
  for (const value of iter) {
    if (!predicate(value)) {
      return false
    }
  }

  return true
}

// TODO: I should remove this at some point
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/reduce
export function reduce<T, S = T>(reducer: Reducer<T, S>, iterable: Iterable<T>, initial: S): S {
  const iter = iterable[Symbol.iterator]()
  let accum = initial

  for (let state = iter.next(); !state.done; state = iter.next()) {
    accum = reducer(accum, state.value)
  }

  return accum
}

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

// TODO: I should remove this at some point
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/map
export function* map<T, S>(transform: Mapper<T, S>, iter: Iterable<T>): Generator<S> {
  for (const value of iter) {
    yield transform(value)
  }
}

// TODO: I should remove this at some point
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter
export function* filter<T>(predicate: Predicate<T>, iter: Iterable<T>): Generator<T> {
  for (const value of iter) {
    if (predicate(value)) {
      yield value
    }
  }
}

export function* chain<T>(...iterables: Array<Iterable<T>>): Generator<T, void, undefined> {
  for (const iterable of iterables) {
    yield* iterable
  }
}

export function* take<T>(iterable: Iterable<T>, count: uint32): Generator<T, void, undefined> {
  let counter = 0

  for (const value of iterable) {
    yield value

    if (++counter === count) {
      return
    }
  }
}

export function* flatten<T>(iterable: Iterable<FlattenIterableType<IterBase<T>>>): Generator<IterBase<T>> {
  for (const value of iterable) {
    if (value && typeof value !== 'string' && value instanceof Object && Symbol.iterator in value) {
      yield* flatten(value)
    } else {
      yield value as IterBase<T>
    }
  }
}

export function* repeat<T>(value: T, times?: uint32): Generator<T> {
  for (let i = 0; i < (times ?? Number.POSITIVE_INFINITY); i++) {
    yield value
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

export function* pairwise<T>(iterable: Iterable<T>): Generator<[T, T]> {
  const iter = iterable[Symbol.iterator]()
  // eslint-disable-next-line prefer-const
  let { value: lastValue, done } = iter.next()

  if (done) {
    return
  }

  for (let { value, done } = iter.next(); !done; { value, done } = iter.next()) {
    yield [lastValue, value]
    lastValue = value
  }
}

export function extractArray<T>(object: Record<string | float64 | symbol, T>) {
  const result: T[] = []

  for (let i = 0; i in object; i++) {
    result.push(object[i])
  }

  return result
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
