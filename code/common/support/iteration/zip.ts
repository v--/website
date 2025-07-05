export function zip<T, S>(iter1: Iterable<T>, iter2: Iterable<S>): Generator<[T, S]>
export function zip(...iterables: Array<Iterable<unknown>>): Generator<unknown[]>
export function* zip(...iterables: Array<Iterable<unknown>>): Generator<unknown[]> {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())

  while (true) {
    const values: unknown[] = []

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const i in iterators) {
      const { done, value } = iterators[i].next()
      if (done) {
        return
      }
      values[i] = value
    }

    yield values
  }
}

export function zipLongest<T, S>(iter1: Iterable<T>, iter2: Iterable<S>): Generator<[T, S]>
export function zipLongest(...iterables: Array<Iterable<unknown>>): Generator<unknown[]>
export function* zipLongest(...iterables: Array<Iterable<unknown>>): Generator<unknown[]> {
  if (iterables.length === 0) {
    return []
  }

  const iterators = iterables.map(iterable => iterable[Symbol.iterator]())
  let atLeastOne = true

  while (atLeastOne) {
    atLeastOne = false
    const values: unknown[] = []

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
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
