export function digestAncestorsAndCumLengths (graph, start, end, ancestors) {
  const vertexData = new Map()
  const arcData = new Map()
  let path_

  for (const v of graph.iterAllVertices()) {
    const path = []

    if (!ancestors.has(v)) {
      vertexData.set(v, [])
      continue
    }

    let current = v

    while (current !== undefined && current !== start) {
      path.push(current)
      current = ancestors.get(current)
    }

    path.push(start)
    path.reverse()

    vertexData.set(v, [
      {
        label: 'Shortest path',
        value: path.join(' -> ')
      }
    ])

    if (v === end) {
      path_ = path
    }
  }

  for (const arc of graph.getAllArcs()) {
    arcData.set(arc, [
      {
        label: 'Arc length',
        value: arc.weight
      }
    ])
  }

  return new AlgorithmResult({ path: path_, vertexData, arcData })
}

export class AlgorithmResult {
  constructor ({ path = [], vertexData = new Map(), arcData = new Map() }) {
    this.path = path
    this.vertexData = vertexData
    this.arcData = arcData
  }
}
