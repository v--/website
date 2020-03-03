import { CoolError } from '../errors.js'
import { orderComparator, inverseOrderComparator } from './sorting.js'

export class IterError extends CoolError {}
export class EmptyIterError extends IterError {}

export function all (predicate, iter) {
  for (const value of iter) {
    if (!predicate(value)) {
      return false
    }
  }

  return true
}

export function reduce (reducer, iterable, initial) {
  const iter = iterable[Symbol.iterator]()
  let accum

  if (initial !== undefined) {
    accum = initial
  } else {
    const state = iter.next()

    if (state.done) {
      throw new EmptyIterError('Nothing to reduce')
    }

    accum = state.value
  }

  for (const value of iter) {
    accum = reducer(value, accum)
  }

  return accum
}

export function * empty () {}

export function * range (from, to, step = 1) {
  const sign = Math.sign(step)

  if (to === undefined) {
    to = from
    from = 0
  }

  for (let i = from; sign * i < sign * to; i += step) {
    yield i
  }
}

export function * map (transform, iter) {
  for (const value of iter) {
    yield transform(value)
  }
}

export function * filter (predicate, iter) {
  for (const value of iter) {
    if (predicate(value)) {
      yield value
    }
  }
}

export function * chain (...iterables) {
  for (const iterable of iterables) {
    yield * iterable
  }
}

export function * take (iterable, count) {
  let counter = 0

  for (const value of iterable) {
    yield value

    if (++counter === count) {
      return
    }
  }
}

export function * zip (...iterables) {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())

  while (true) {
    const values = []

    for (const i in iterators) {
      const { done, value } = iterators[i].next()
      if (done) return
      values[i] = value
    }

    yield values
  }
}

export function * uniqueBy (iter, key) {
  const values = Array.from(iter)
  const set = new Set()

  for (const value of values) {
    const k = key ? key(value) : value

    if (!set.has(k)) {
      set.add(k)
      yield value
    }
  }
}

export function sort (iter, ascending = true) {
  const array = Array.from(iter)

  if (ascending) {
    return array.sort(orderComparator)
  }

  return array.sort(inverseOrderComparator)
}

export function schwartzSort (transform, iter) {
  const array = Array.from(iter)
  const values = new Map(map(x => [x, transform(x)], array))
  return array.sort((a, b) => values.get(a) - values.get(b))
}

export function schwartzMax (transform, iterable, strict = true) {
  return schwartzMin(x => -transform(x), iterable, strict)
}

export function schwartzMin (transform, iterable, strict = true) {
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

export function shuffle (iter) {
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

export function * flatten (iter) {
  for (const value of iter) {
    if (value && value !== iter && value[Symbol.iterator]) {
      yield * flatten(value)
    } else {
      yield value
    }
  }
}

export function * repeat (value, times = Number.Infinity) {
  for (let i = 0; i < times; i++) {
    yield value
  }
}

export function counter (iter) {
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

export function swap (array, i, j) {
  const tmp = array[i]
  array[i] = array[j]
  array[j] = tmp
}

export function * product (...iterables) {
  function * productImpl (fixed, variable) {
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

export function union (...iterables) {
  const result = new Set()

  for (const iterable of iterables) {
    for (const item of iterable) {
      result.add(item)
    }
  }

  return result
}

export function intersection (...iterables) {
  const result = new Set()
  const sets = Array.from(iterables).map(it => new Set(it))

  for (const item of union(...sets)) {
    let addItem = true

    for (const set of sets) {
      addItem &= set.has(item)
    }

    if (addItem) {
      result.add(item)
    }
  }

  return result
}

export function first (iterable) {
  const iter = iterable[Symbol.iterator]()
  const state = iter.next()

  if (state.done) {
    throw new EmptyIterError('Cannot get the first element of an empty iterable')
  }

  return state.value
}
