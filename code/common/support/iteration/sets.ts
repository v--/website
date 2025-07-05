export function union<T>(...iterables: Array<Iterable<T>>): Set<T> {
  const result = new Set<T>()

  for (const iterable of iterables) {
    for (const item of iterable) {
      result.add(item)
    }
  }

  return result
}

export function intersection<T>(...iterables: Array<Iterable<T>>): Set<T> {
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
