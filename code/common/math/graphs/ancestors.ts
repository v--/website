import { Graph } from './graph.js'

export function constructPathFromAncestors<T>(graph: Graph<T>, ancestors: TCons.NonStrictMap<T, T>, start: T, end: T) {
  if (!ancestors.has(end)) {
    return undefined
  }

  const path = []
  let current = end

  // The hare detects cycles by iterating twice as fast
  let hare = end
  let iterationsRemaining = Number.POSITIVE_INFINITY

  while (current !== start) {
    if (current === undefined || iterationsRemaining === 0) {
      return undefined
    }

    const last = current
    current = ancestors.get(current)
    hare = ancestors.get(ancestors.get(hare))

    if (current === hare) {
      let period = 1
      hare = ancestors.get(current)

      while (hare !== current) {
        hare = ancestors.get(hare)
        period++
      }

      iterationsRemaining = period
    }

    const arc = graph.getArc(current, last)

    if (!arc) {
      return undefined
    }

    path.push(arc)
    iterationsRemaining++
  }

  path.reverse()
  return path
}

export function subgraphFromAncestorMap<T>(graph: Graph<T>, ancestors: TCons.NonStrictMap<T, T>) {
  const result = new Graph<T>()

  for (const [to, from] of ancestors.entries()) {
    const arc = graph.getArc(from, to)

    if (arc) {
      result.addArc(arc)
    }
  }

  return result
}
