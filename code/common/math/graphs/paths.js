export function constructPathFromAncestors (graph, ancestors, start, end) {
  if (!ancestors.has(end)) {
    return null
  }

  const path = []
  let current = end

  while (current !== start) {
    const last = current
    current = ancestors.get(current)

    if (current === undefined) {
      return null
    }

    const arc = graph.getArc(current, last)

    if (arc === null) {
      return null
    }

    path.push(arc)
  }

  path.reverse()
  return path
}
