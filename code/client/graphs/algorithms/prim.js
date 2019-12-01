import { BinaryHeap } from '../../../common/containers/binary_heap.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'

export const prim = Object.freeze({
  name: "Prim's algorithm",
  id: 'prim',
  type: AlgorithmType.MIN_SPANNING_TREE,
  date: '2019-11-30',
  graph: DEFAULT_GRAPH_UNDIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, root = 0, _end) {
    const ancestors = new Map()
    const queue = new BinaryHeap()
    queue.insert(root, 0)

    while (!queue.isEmpty) {
      const min = queue.pop()

      for (const arc of graph.getOutgoingArcs(min.item)) {
        const newLen = arc.weight

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
      start: root,
      subgraph: subgraphFromAncestorMap(graph, ancestors, root),
      vertexData: fillPathAncestorVertexData(graph, ancestors, root),
      arcData: fillArcWeightData(graph)
    })
  }
})
