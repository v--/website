import { Matrix } from '../../../common/math/linalg/matrix.js'
import { pathLengthMatrix } from '../../../common/math/graphs/graph_matrices.js'
import { getForceDirectedLayout } from '../../../common/math/graphs/layout/force_directed.js'

import { digestAncestorsAndCumLengths } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH } from '../graphs.js'

export const floyd = Object.freeze({
  name: "Floyd's algorithm",
  type: AlgorithmType.SHORTEST_PATH,
  date: '2019-11-24',
  getLayout: getForceDirectedLayout,
  graph: DEFAULT_GRAPH,

  run (graph, start = 0, end = graph.order - 1) {
    const cumLengths = pathLengthMatrix(graph)
    const paths = Matrix.zero(graph.order)

    for (const u of graph.iterAllVertices()) {
      for (const v of graph.iterAllVertices()) {
        paths.set(u, v, u)
      }
    }

    for (const u of graph.iterAllVertices()) {
      for (const v of graph.iterAllVertices()) {
        for (const k of graph.iterAllVertices()) {
          const newValue = cumLengths.get(u, k) + cumLengths.get(k, v)
          const currentValue = cumLengths.get(u, v)

          if (newValue < currentValue) {
            cumLengths.set(u, v, newValue)
            paths.set(u, v, paths.get(k, v))
          }
        }
      }
    }

    const ancestors = {
      has (v) {
        return cumLengths.get(start, v) !== Number.POSITIVE_INFINITY
      },
      get (v) {
        return paths.get(start, v)
      }
    }

    return digestAncestorsAndCumLengths(graph, start, end, ancestors)
  }
})
