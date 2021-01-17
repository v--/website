import { CoolError } from '../errors.js'
import { orderComparator, inverseOrderComparator } from './sorting.js'

export class IterError extends CoolError { }
export class EmptyIterError extends IterError { }

/**
 * @template T
 * @typedef {(arg: T) => boolean} Predicate
 */

/**
 * @template T
 * @param {Predicate<T>} predicate
 * @param {Iterable<T>} iter
 * @returns boolean
 */
export function all(predicate, iter) {
  for (const value of iter) {
    if (!predicate(value)) {
      return false
    }
  }
  return true
}

/**
 * @template T, S = T
 * @typedef {(value: T, accum: S) => S} Reducer
 */

/**
 * @template T, S = T
 * @param {Reducer<T, S>} reducer
 * @param {Iterable<T>} iterable
 * @param {S} initial
 * @returns S
 */
export function reduce(reducer, iterable, initial) {
  const iter = iterable[Symbol.iterator]()
  let accum = initial

  for (let state = iter.next(); !state.done; state = iter.next()) {
    accum = reducer(state.value, accum)
  }

  return accum
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function* empty() {}

/**
 * @param {number} from
 * @param {number} [to]
 * @param {number} [step]
 * @returns {Generator<number>}
 */
export function* range(from, to, step = 1) {
  const sign = Math.sign(step)
  if (to === undefined) {
    to = from
    from = 0
  }

  for (let i = from; sign * i < sign * to; i = i + step) {
    yield i
  }
}

/**
 * @template T, S
 * @typedef {(value: T) => S} Mapper
 */

/**
 * @template T, S
 * @param {Mapper<T, S>} transform
 * @param {Iterable<T>} iter
 * @returns {Generator<S>}
 */
export function* map(transform, iter) {
  for (const value of iter) {
    yield transform(value)
  }
}

/**
 * @template T
 * @param {Predicate<T>} predicate
 * @param {Iterable<T>} iter
 * @returns {Generator<T>}
 */
export function* filter(predicate, iter) {
  for (const value of iter) {
    if (predicate(value)) {
      yield value
    }
  }
}

/**
 * @template T
 * @param {Array<Iterable<T>>} iterables
 * @returns {Generator<T, void, undefined>}
 */
export function* chain(...iterables) {
  for (const iterable of iterables) {
    yield* iterable
  }
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {uint32} count
 * @returns {Generator<T, void, undefined>}
 */
export function* take(iterable, count) {
  let counter = 0

  for (const value of iterable) {
    yield value

    if (++counter === count) {
      return
    }
  }
}

/**
 * @param {Array<Iterable<unknown>>} iterables
 * @return {Generator<unknown[]>}
 */
export function * zip(...iterables) {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())

  while (true) {
    /** @type any */
    const values = []

    for (const i in iterators) {
      const { done, value } = iterators[i].next()
      if (done) return
      values[i] = value
    }

    yield values
  }
}

/**
 * @template T, S
 * @param {Iterable<T>} iter1
 * @param {Iterable<S>} iter2
 * @returns {Generator<[T, S]>}
 */
export function zip2(iter1, iter2) {
  return /** @type {Generator<[T, S]>} */(zip2(iter1, iter2))
}

/**
 * @param {Array<Iterable<unknown>>} iterables
 * @return {Generator<unknown[]>}
 */
export function* zipLongest(...iterables) {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())
  let atLeastOne = true

  while (atLeastOne) {
    atLeastOne = false
    /** @type any */
    const values = []

    for (const i in iterators) {
      const { done, value } = iterators[i].next()

      if (done) {
        values[i] = undefined
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

/**
 * @template T, S
 * @param {Iterable<T>} iter1
 * @param {Iterable<S>} iter2
 * @returns {Generator<[T, S]>}
 */
export function zipLongest2(iter1, iter2) {
  return /** @type {Generator<[T, S]>} */(zipLongest(iter1, iter2))
}

/**
 * @template T, S
 * @param {Iterable<T>} iter
 * @param {Mapper<T, S>} [key]
 * @returns {Generator<T>}
 */
export function* uniqueBy(iter, key) {
  const values = Array.from(iter)

  /** @type {Set<T | S>} */
  const set = new Set()

  for (const value of values) {
    const k = key ? key(value) : value

    if (!set.has(k)) {
      set.add(k)
      yield value
    }
  }
}

/**
 * @template T
 * @param {Iterable<T>} iter
 * @param {boolean} ascending
 * @returns {T[]}
 */
export function sort(iter, ascending = true) {
  const array = Array.from(iter)

  if (ascending) {
    return array.sort(orderComparator)
  }

  return array.sort(inverseOrderComparator)
}

/**
 * @template T
 * @param {Mapper<T, uint32>} transform
 * @param {Iterable<T>} iter
 * @returns {T[]}
 */
export function schwartzSort(transform, iter) {
  const array = Array.from(iter)

  const values = /** @type {NonStrictMap<T, uint32>} */ (new Map(
    map(x => [x, transform(x)], array)
  ))

  return array.sort((a, b) => values.get(a) - values.get(b))
}

/**
 * @template T
 * @param {Mapper<T, uint32>} transform
 * @param {Iterable<T>} iterable
 * @param {boolean} strict
 * @returns {T}
 */
export function schwartzMax(transform, iterable, strict = true) {
  return schwartzMin(x => -transform(x), iterable, strict)
}

/**
 * @template T
 * @param {Mapper<T, uint32>} transform
 * @param {Iterable<T>} iterable
 * @param {boolean} strict
 * @returns {T}
 */
export function schwartzMin(transform, iterable, strict = true) {
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

/**
 * @template T
 * @param {Iterable<T>} iter
 * @returns {T[]}
 */
export function shuffle(iter) {
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

/**
 * @template T
 * @param {Iterable<FlattenIterableType<IterBase<T>>>} iter
 * @returns {Generator<IterBase<T>>}
 */
export function* flatten(iter) {
  for (const value of iter) {
    if (value && typeof value !== 'string' && value instanceof Object && Symbol.iterator in value) {
      yield* flatten(value)
    }

    else {
      yield /** @type {IterBase<T>} */ (value)
    }
  }
}

/**
 * @template T
 * @param {T} value
 * @param {number} times
 * @returns {Generator<T>}
 */
export function* repeat(value, times = Number.POSITIVE_INFINITY) {
  for (let i = 0; i < times; i++) {
    yield value
  }
}

/**
 * @template T
 * @param {Iterable<T>} iter
 * @returns {Map<T, uint32>}
 */
export function counter(iter) {
  /** @type {NonStrictMap<T, uint32>} */
  const cntr = new Map()

  for (const value of iter) {
    if (cntr.has(value)) {
      cntr.set(value, cntr.get(value) + 1)
    }

    else {
      cntr.set(value, 1)
    }
  }

  return cntr
}

/**
 * @template T
 * @param {T[]} array
 * @param {uint32} i
 * @param {uint32} j
 */
export function swap(array, i, j) {
  const tmp = array[i]
  array[i] = array[j]
  array[j] = tmp
}

/**
 * @param {Array<Iterable<unknown>>} iterables
 * @return {Generator<unknown[]>}
 */
export function* product(...iterables) {
  /**
   * @param {unknown[]} fixed
   * @param {Array<unknown[]>} variable
   * @returns {Generator<unknown[]>}
   */
  function * productImpl(fixed, variable) {
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

/**
 * @template T, S
 * @param {Iterable<T>} iter1
 * @param {Iterable<S>} iter2
 * @returns {Generator<[T, S]>}
 */
export function product2(iter1, iter2) {
  return /** @type {Generator<[T, S]>} */(product(iter1, iter2))
}

/**
 * @template T
 * @param {Array<Iterable<T>>} iterables
 * @returns {Set<T>}
 */
export function union(...iterables) {
  /** @type {Set<T>} */
  const result = new Set()

  for (const iterable of iterables) {
    for (const item of iterable) {
      result.add(item)
    }
  }

  return result
}

/**
 * @template T
 * @param {Array<Iterable<T>>} iterables
 * @returns {Set<T>}
 */
export function intersection(...iterables) {
  /** @type {Set<T>} */
  const result = new Set()
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

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @returns {T}
 */
export function first(iterable) {
  const iter = iterable[Symbol.iterator]()
  const state = iter.next()

  if (state.done) {
    throw new EmptyIterError('Cannot get the first element of an empty iterable')
  }

  return state.value
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @returns {T}
 */
export function last(iterable) {
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

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @returns {Generator<T[]>}
 */
export function * cumulative(iterable) {
  const payload = []

  for (const value of iterable) {
    payload.push(value)
    yield payload.slice()
  }
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @returns {Generator<[uint32, T]>}
 */
export function * enumerate(iterable) {
  let i = 0

  for (const value of iterable) {
    yield [i++, value]
  }
}
