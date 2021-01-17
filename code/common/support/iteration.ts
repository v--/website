import { CoolError } from '../errors.js'
import { IterBase } from '../types/typecons.js'
import { orderComparator, inverseOrderComparator } from './sorting.js'

export class IterError extends CoolError {}
export class EmptyIterError extends IterError {}

interface Predicate<T> {
  (arg: T): boolean
}

export function all<T>(predicate: Predicate<T>, iter: Iterable<T>): boolean {
  for (const value of iter) {
    if (!predicate(value)) {
      return false
    }
  }

  return true
}

interface Reducer<T, S = T> {
  (value: T, accum: S): S
}

export function reduce<T, S = T>(reducer: Reducer<T, S>, iterable: Iterable<T>, initial: S): S {
  const iter = iterable[Symbol.iterator]()
  let accum: S = initial

  for (let state = iter.next(); !state.done; state = iter.next()) {
    accum = reducer(state.value, accum)
  }

  return accum
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function * empty() {}

export function * range<T extends number>(from: T, to?: T, step: T = 1 as T): Generator<T> {
  const sign = Math.sign(step)

  if (to === undefined) {
    to = from
    from = 0 as T
  }

  for (let i = from; sign * i < sign * to; i = i + step as T) {
    yield i
  }
}

interface Mapper<T, S> {
  (value: T): S
}

export function * map<T, S>(transform: Mapper<T, S>, iter: Iterable<T>): Generator<S> {
  for (const value of iter) {
    yield transform(value)
  }
}

export function * filter<T>(predicate: Predicate<T>, iter: Iterable<T>): Generator<T> {
  for (const value of iter) {
    if (predicate(value)) {
      yield value
    }
  }
}

export function * chain<T>(...iterables: Iterable<T>[]): Generator<T, void, undefined> {
  for (const iterable of iterables) {
    yield * iterable
  }
}

export function * take<T>(iterable: Iterable<T>, count: uint32): Generator<T> {
  let counter = 0

  for (const value of iterable) {
    yield value

    if (++counter === count) {
      return
    }
  }
}

export function zip(): Generator<[]> 
export function zip<T>(...iterables: [Iterable<T>]): Generator<[T]>
export function zip<T, S>(...iterables: [Iterable<T>, Iterable<S>]): Generator<[T, S]>
export function zip<T, S, R>(...iterables: [Iterable<T>, Iterable<S>, Iterable<R>]): Generator<[T, S, R]>
export function * zip(...iterables: Iterable<unknown>[]): Generator<unknown[]> {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())

  while (true) {
    const values: unknown[] = []

    for (const i in iterators) {
      const { done, value } = iterators[i].next()
      if (done) return
      values[i] = value
    }

    yield values
  }
}

export function zipLongest<T, S>(...iterables: [Iterable<T>, Iterable<S>]): Generator<[T, S]>
export function zipLongest<T, S, R>(...iterables: [Iterable<T>, Iterable<S>, Iterable<R>]): Generator<[T, S, R]>
export function * zipLongest(...iterables: Iterable<unknown>[]): Generator<unknown[]> {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())
  let atLeastOne = true

  while (atLeastOne) {
    atLeastOne = false
    const values: unknown[] = []

    for (const i in iterators) {
      const { done, value } = iterators[i].next()

      if (done) {
        // values[i] = undefined
      } else {
        values[i] = value
        atLeastOne = true
      }
    }

    if (atLeastOne) {
      yield values
    }
  }
}

export function * uniqueBy<T, S>(iter: Iterable<T>, key?: Mapper<T, S>): Generator<T> {
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

export function sort<T>(iter: Iterable<T>, ascending = true): T[] {
  const array = Array.from(iter)

  if (ascending) {
    return array.sort(orderComparator)
  }

  return array.sort(inverseOrderComparator)
}

export function schwartzSort<T>(transform: Mapper<T, uint32>, iter: Iterable<T>): T[] {
  const array = Array.from(iter)
  const values = new Map<T, uint32>(map(x => [x, transform(x)], array))
  return array.sort((a, b) => values.get(a)! - values.get(b)!)
}

export function schwartzMax<T>(transform: Mapper<T, float64>, iterable: Iterable<T>, strict = true): T {
  return schwartzMin(x => -transform(x), iterable, strict)
}

export function schwartzMin<T>(transform: Mapper<T, float64>, iterable: Iterable<T>, strict = true): T {
  const iter = iterable[Symbol.iterator]()
  let { value: x, done } = iter.next()

  if (done) {
    throw new EmptyIterError('Cannot find the minimum of an empty collection')
  }

  let minX = x
  let minValue = transform(x)

  for (; !done; { value: x, done } = iter.next()) {
    const value = transform(x)

    if (strict ? value < minValue : value <= minValue) {
      minX = x
      minValue = value
    }
  }

  return minX
}

export function shuffle<T>(iter: Iterable<T>): T[] {
  const array = Array.from(iter)
  const n = array.length

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (n - i))
    const temp = array[j]
    array[j] = array[i]
    array[i] = temp
  }

  return array
}

type FlattenType<T> = T | Iterable<FlattenType<T>>
export function * flatten<T>(iter: Iterable<FlattenType<IterBase<T>>>): Generator<IterBase<T>> {
  for (const value of iter) {
    if (value && typeof value !== 'string' && value instanceof Object && Symbol.iterator in value) {
      yield * flatten(value as Iterable<IterBase<T>>)
    } else {
      yield value as IterBase<T>
    }
  }
}

export function * repeat<T>(value: T, times = Number.POSITIVE_INFINITY): Generator<T> {
  for (let i = 0; i < times; i++) {
    yield value
  }
}

export function counter<T>(iter: Iterable<T>): Map<T, uint32> {
  const cntr = new Map()

  for (const value of iter) {
    if (cntr.has(value)) {
      cntr.set(value, cntr.get(value) + 1)
    } else {
      cntr.set(value, 1)
    }
  }

  return cntr
}

export function swap<T>(array: T[], i: uint32, j: uint32): void {
  const tmp = array[i]
  array[i] = array[j]
  array[j] = tmp
}

export function product(): Generator<[]>
export function product<T>(...iterables: [Iterable<T>]): Generator<[T]>
export function product<T, S>(...iterables: [Iterable<T>, Iterable<S>]): Generator<[T, S]>
export function product<T, S, R>(...iterables: [Iterable<T>, Iterable<S>, Iterable<R>]): Generator<[T, S, R]>
export function product<T, S, R, P>(...iterables: [Iterable<T>, Iterable<S>, Iterable<R>, Iterable<P>]): Generator<[T, S, R, P]>
export function * product(...iterables: Iterable<unknown>[]): Generator<unknown[]> {
  function * productImpl(fixed: unknown[], variable: Array<unknown[]>): Generator<unknown[]> {
    if (variable.length === 0) {
      yield fixed
      return
    }

    const current = variable[0]
    const rest = variable.slice(1)

    for (const value of current) {
      yield * productImpl(fixed.concat([value]), rest)
    }
  }

  if (iterables.length === 0) {
    return
  }

  yield * productImpl([], iterables.map(iterable => Array.from(iterable)))
}

export function union<T>(...iterables: Iterable<T>[]): Set<T> {
  const result = new Set<T>()

  for (const iterable of iterables) {
    for (const item of iterable) {
      result.add(item)
    }
  }

  return result
}

export function intersection<T>(...iterables: Iterable<T>[]): Set<T> {
  const result = new Set<T>()
  const sets = Array.from(iterables).map(it => new Set(it))

  for (const item of union(...sets)) {
    let addItem = true

    for (const set of sets) {
      addItem = addItem && set.has(item)
    }

    if (addItem) {
      result.add(item)
    }
  }

  return result
}

export function first<T>(iterable: Iterable<T>): T {
  const iter = iterable[Symbol.iterator]()
  const state = iter.next()

  if (state.done) {
    throw new EmptyIterError('Cannot get the first element of an empty iterable')
  }

  return state.value
}

export function last<T>(iterable: Iterable<T>): T {
  const iter = iterable[Symbol.iterator]()
  let newState = iter.next()

  if (newState.done) {
    throw new EmptyIterError('Cannot get the last element of an empty iterable')
  }

  let state = newState

  while (!newState.done) {
    state = newState
    newState = iter.next()
  }

  return state.value
}

export function * cumulative<T>(iterable: Iterable<T>): Generator<T[]> {
  const payload = []

  for (const value of iterable) {
    payload.push(value)
    yield payload.slice()
  }
}

export function * enumerate<T>(iterable: Iterable<T>): Generator<[uint32, T]> {
  let i = 0

  for (const value of iterable) {
    yield [i++, value]
  }
}
