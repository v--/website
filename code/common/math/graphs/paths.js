export function findPath (graph, start, end, marked = new Set()) {
  marked.add(start)

  if (start === end) {
    return []
  }

  for (const arc of graph.iterOutgoingArcs(start)) {
    if (marked.has(arc.dest)) {
      continue
    }

    const path = findPath(graph, arc.dest, end, marked)

    if (path !== null) {
      return [arc].concat(path)
    }
  }

  return null
}
