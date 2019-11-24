import { Matrix } from '../../../common/math/linalg/matrix.js'
import { pathLengthMatrix } from '../../../common/math/graphs/graph_matrices.js'
import { getForceDirectedLayout } from '../../../common/math/graphs/layout/force_directed.js'

import { AlgorithmResult } from '../support/algorithm_result.js'
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

    for (const k of graph.iterAllVertices()) {
      for (const u of graph.iterAllVertices()) {
        for (const v of graph.iterAllVertices()) {
          const newValue = cumLengths.get(u, k) + cumLengths.get(k, v)
          const currentValue = cumLengths.get(u, v)

          if (newValue < currentValue) {
            cumLengths.set(u, v, newValue)
            paths.set(u, v, paths.get(k, v))
          }
        }
      }
    }

    const shortest = []

    for (const v of graph.iterAllVertices()) {
      const path = []
      let current = v

      while (current !== start) {
        path.push(current)
        current = paths.get(start, current)
      }

      path.push(start)
      path.reverse()
      shortest[v] = path
    }

    const vertexData = new Map()
    const arcData = new Map()

    for (const v of graph.iterAllVertices()) {
      const length = cumLengths.get(start, v)
      const datum = []

      if (Number.isFinite(length)) {
        datum.push(
          {
            label: 'Shortest path',
            value: shortest[v].join(' -> ')
          },
          {
            label: 'Shortest path length',
            value: cumLengths.get(start, v)
          }
        )
      }

      vertexData.set(v, datum)
    }

    for (const arc of graph.iterAllArcs()) {
      arcData.set(arc, [
        {
          label: 'Arc length',
          value: arc.weight
        }
      ])
    }

    const path = shortest[end]
    return new AlgorithmResult({ path, vertexData, arcData })
  }
})
