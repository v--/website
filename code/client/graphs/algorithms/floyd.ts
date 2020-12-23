import { Matrix } from '../../../common/math/linalg/matrix.js'
import { pathLengthMatrix } from '../../../common/math/graphs/graph_matrices.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { uint32 } from '../../../common/types/numeric.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { NonStrictMap } from '../../../common/types/non_strict_map.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'

export const floyd: GraphAlgorithm<uint32> = Object.freeze({
  name: "Floyd's algorithm",
  id: 'floyd',
  type: GraphAlgorithmType.shortestPathTree,
  date: '2019-11-24',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends uint32>(graph: Graph<T>, start: T = 0 as T, _end: T) {
    const pathLengths = pathLengthMatrix(graph)
    const allAncestors = Matrix.zero(graph.order)
    const ancestors: NonStrictMap<T, T> = new Map()

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
              ancestors.set(v, allAncestors.get(u, v) as T)
            }
          }
        }
      }
    }

    return new GraphAlgorithmResult({
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
