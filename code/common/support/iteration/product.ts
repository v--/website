export function product<T, S>(iter1: Iterable<T>, iter2: Iterable<S>): Generator<[T, S]>
export function product(...iterables: Array<Iterable<unknown>>): Generator<unknown[]>
export function* product(...iterables: Array<Iterable<unknown>>): Generator<unknown[]> {
  function* productImpl(fixed: unknown[], variable: Array<unknown[]>): Generator<unknown[]> {
    if (variable.length === 0) {
      yield fixed
      return
    }

    const current = variable[0]
    const rest = variable.slice(1)

    for (const value of current) {
      yield* productImpl(fixed.concat([value]), rest)
    }
  }

  if (iterables.length === 0) {
    return
  }

  yield* productImpl([], iterables.map(iterable => Array.from(iterable)))
}
