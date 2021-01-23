import { Matrix } from '../../../common/math/linalg/matrix.js'
import { pathLengthMatrix } from '../../../common/math/graphs/graph_matrices.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { Graph } from '../../../common/math/graphs/graph.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const floyd = Object.freeze({
  name: "Floyd's algorithm",
  id: 'floyd',
  type: 'shortestPathTree',
  date: '2019-11-24',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  /**
   * @param {Graph<TNum.UInt32>} graph
   * @param {TNum.UInt32} start
   * @param {TNum.UInt32} _end
   * @returns {TGraphOpt.IGraphAlgorithmResult<TNum.UInt32>}
   */
  run(graph, start = 0, _end) {
    const pathLengths = pathLengthMatrix(graph)

    /** @type {Matrix} */
    const allAncestors = Matrix.zero(graph.order)

    /** @type {TCons.NonStrictMap<TNum.UInt32, TNum.UInt32>} */
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
              ancestors.set(v, /** @type {TNum.UInt32} */ (allAncestors.get(u, v)))
            }
          }
        }
      }
    }

    return {
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    }
  }
})
