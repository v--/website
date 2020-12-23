import { BinaryHeap } from '../../../common/containers/binary_heap.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { uint32 } from '../../../common/types/numeric.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { NonStrictMap } from '../../../common/types/non_strict_map.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'

export const dijkstra: GraphAlgorithm<uint32> = Object.freeze({
  name: "Dijsktra's algorithm",
  id: 'dijkstra',
  type: GraphAlgorithmType.shortestPathTree,
  date: '2019-11-15',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends uint32>(graph: Graph<T>, start: T = 0 as T, _end: T) {
    const ancestors: NonStrictMap<T, T> = new Map()
    const queue = new BinaryHeap<T>()
    queue.insert(start, 0)

    while (!queue.isEmpty) {
      const min = queue.pop()

      for (const arc of graph.getOutgoingArcs(min.item)) {
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

    return new GraphAlgorithmResult({
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
