import { CoolError } from '../errors'

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

  if (initial) {
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

  while (true) { // eslint-disable-line no-constant-condition
    const values = Array.of(iterators.length)

    for (const i in iterators) {
      const { done, value } = iterators[i].next()
      if (done) return
      values[i] = value
    }

    yield values
  }
}

export function unique (iter) {
  return new Set(iter).values()
}

export function sort (iter, comparator = (a, b) => a - b) {
  return Array.from(iter).sort(comparator)
}

export function shuffle (iter) {
  const array = Array.from(iter)
  const n = array.length
  const shuffled = []

  for (let i = 0; i < n; i++) {
    const j = Math.floor(Math.random() * (n - i - 1))
    shuffled[i] = array[j]
    array[j] = array[n - i - 1]
  }

  return shuffled
}

export function * flatten (iter) {
  for (const value of iter) {
    // Cannot use interfaces here because of circular dependencies
    if (value && value[Symbol.iterator]) {
      yield * flatten(value)
    } else {
      yield value
    }
  }
}

export function * repeat (value, times) {
  for (let i = 0; i < times; i++) {
    yield value
  }
}

export function counter (iter) {
  let cntr = new Map()

  for (const value of iter) {
    if (cntr.has(value)) {
      cntr.set(value, cntr.get(value) + 1)
    } else {
      cntr.set(value, 1)
    }
  }

  return cntr
}

export function separate (array) {
  const totalCount = counter(array)
  const usedCount = new Map()
  const result = []

  for (let i = 0; i < array.length; i++) {
    const value = array[i]
    let rank = 1

    for (let j = 1; j < value; j++) {
      rank += (totalCount.get(j) || 0)
    }

    const used = (usedCount.get(value) || 0)
    usedCount.set(value, used + 1)
    result[i] = rank + used
  }

  return result
}

export function swap (array, i, j) {
  const tmp = array[i]
  array[i] = array[j]
  array[j] = tmp
}

export function sum (iter) {
  return reduce((a, b) => a + b, iter)
}
