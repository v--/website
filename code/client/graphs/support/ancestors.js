export function constructPathFromAncestors (graph, ancestors, start, end) {
  if (!ancestors.has(end)) {
    return null
  }

  const path = []
  let current = end

  // The hare detects cycles by iterating twice as fast
  let hare = end
  let iterationsRemaining = Number.POSITIVE_INFINITY

  while (current !== start) {
    if (current === undefined || iterationsRemaining === 0) {
      return null
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

    if (arc === null) {
      return null
    }

    path.push(arc)
    iterationsRemaining++
  }

  path.reverse()
  return path
}

export function ancestorMapToArcs (graph, ancestors) {
  const arcs = []

  for (const [to, from] of ancestors.entries()) {
    arcs.push(graph.getArc(from, to))
  }

  return arcs
}
