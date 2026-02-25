// TODO: Replace with Iterator.zip when the latter proliferates
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
