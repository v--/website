import { Graph, GraphArc } from './graph.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {TCons.NonStrictMap<T, T>} ancestors
 * @param {T} start
 * @param {T} end
 * @returns {Array<GraphArc<T>> | undefined}
 */
export function constructPathFromAncestors(graph, ancestors, start, end) {
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

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {TCons.NonStrictMap<T, T>} ancestors
 * @returns {Graph<T>}
 */
export function subgraphFromAncestorMap(graph, ancestors) {
  /** @type {Graph<T>} */
  const result = new Graph()

  for (const [to, from] of ancestors.entries()) {
    const arc = graph.getArc(from, to)

    if (arc) {
      result.addArc(arc)
    }
  }

  return result
}
