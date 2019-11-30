export function constructPathFromAncestors (graph, ancestors, start, end) {
  if (!ancestors.has(end)) {
    return null
  }

  const path = []
  let current = end
  // The Hare is used for cycle detection by iterating twice as fast
  let hare = ancestors.get(end)

  while (current !== start) {
    if (current === undefined || current === hare) {
      return null
    }

    const last = current
    current = ancestors.get(current)
    hare = ancestors.get(ancestors.get(hare))

    const arc = graph.getArc(current, last)

    if (arc === null) {
      return null
    }

    path.push(arc)
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
