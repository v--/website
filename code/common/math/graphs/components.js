function recurseAndLabel (graph, v, marked, labels) {
  const currentLabel = labels.get(v)
  for (const arc of graph.iterOutcomingArcs(v)) {
    if (!marked.has(arc.dest)) {
      labels.set(arc.dest, currentLabel)
      marked.add(arc.dest)
      recurseAndLabel(graph, arc.dest, marked, labels)
    }
  }
}

export function labelComponents (graph) {
  const marked = new Set()
  const labels = new Map()
  let currentLabel = 0

  for (const v of graph.iterAllVertices()) {
    if (!marked.has(v)) {
      labels.set(v, currentLabel++)
      recurseAndLabel(graph, v, marked, labels)
    }
  }

  return labels
}
