import { Matrix } from '../../../common/math/linalg/matrix.js'
import { pathLengthMatrix } from '../../../common/math/graphs/graph_matrices.js'

import { constructPathFromAncestors } from '../support/ancestors.js'
import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const floyd = Object.freeze({
  name: "Floyd's algorithm",
  type: AlgorithmType.SHORTEST_PATH,
  date: '2019-11-24',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, start = 0, end = graph.order - 1) {
    const pathLengths = pathLengthMatrix(graph)
    const allAncestors = Matrix.zero(graph.order)
    const ancestors = new Map()

    for (const u of graph.iterAllVertices()) {
      ancestors.set(u, start)

      for (const v of graph.iterAllVertices()) {
        allAncestors.set(u, v, u)
      }
    }

    for (const u of graph.iterAllVertices()) {
      for (const v of graph.iterAllVertices()) {
        for (const k of graph.iterAllVertices()) {
          const newValue = pathLengths.get(u, k) + pathLengths.get(k, v)
          const currentValue = pathLengths.get(u, v)

          if (newValue < currentValue) {
            pathLengths.set(u, v, newValue)
            allAncestors.set(u, v, allAncestors.get(k, v))

            if (u === start) {
              ancestors.set(v, allAncestors.get(u, v))
            }
          }
        }
      }
    }

    return new AlgorithmResult({
      start,
      end,
      highlightedArcs: constructPathFromAncestors(graph, ancestors, start, end),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
