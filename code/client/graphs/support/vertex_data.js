import { constructPathFromAncestors } from '../support/ancestors.js'

export function fillPathAncestorVertexData (graph, ancestors, start) {
  const vertexData = new Map()

  for (const v of graph.iterAllVertices()) {
    const path = constructPathFromAncestors(graph, ancestors, start, v)

    if (path === null) {
      vertexData.set(v, [])
    } else {
      let weight = 0

      for (const arc of path) {
        weight += arc.weight
      }

      vertexData.set(v, [
        {
          label: `Optimal path from ${start}`,
          value: [start].concat(path.map(p => p.dest)).join(' -> ')
        },
        {
          label: 'Optimal path weight',
          value: weight
        }
      ])
    }
  }

  return vertexData
}
