import { BinaryHeap } from '../../../common/containers/binary_heap.js'
import { getForceDirectedLayout } from '../../../common/math/graphs/layout/force_directed.js'
import { constructPathFromAncestors } from '../../../common/math/graphs/paths.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH } from '../graphs.js'

export const dijkstra = Object.freeze({
  name: "Dijsktra's algorithm",
  type: AlgorithmType.SHORTEST_PATH,
  date: '2019-11-15',
  getLayout: getForceDirectedLayout,
  graph: DEFAULT_GRAPH,

  run (graph, start = 0, end = graph.order - 1) {
    const ancestors = new Map()
    const queue = new BinaryHeap()
    queue.insert(start, 0)

    while (!queue.isEmpty) {
      const min = queue.pop()

      for (const arc of graph.getOutcomingArcs(min.item)) {
        const newLen = min.weight + arc.weight

        if (queue.hasItem(arc.dest)) {
          if (newLen < queue.getItemWeight(arc.dest)) {
            queue.updateItemWeight(arc.dest, newLen)
            ancestors.set(arc.dest, min.item)
          }
        } else if (!ancestors.has(arc.dest)) {
          queue.insert(arc.dest, newLen)
          ancestors.set(arc.dest, min.item)
        }
      }
    }

    return new AlgorithmResult({
      path: constructPathFromAncestors(graph, ancestors, start, end),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
