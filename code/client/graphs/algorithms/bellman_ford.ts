import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { NonStrictMap } from '../../../common/types/non_strict_map.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { uint32 } from '../../../common/types/numeric.js'

export const bellmanFord: GraphAlgorithm<uint32> = Object.freeze({
  name: "Bellman and Ford's algorithm",
  id: 'bellman_ford',
  type: GraphAlgorithmType.shortestPathTree,
  date: '2019-11-15',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends uint32>(graph: Graph<T>, start: T = 0 as T, _end: T) {
    const ancestors: NonStrictMap<T, T> = new Map()
    const lengths: NonStrictMap<T, uint32> = new Map()
    lengths.set(start, 0)

    for (let i = 1; i < graph.order; i++) {
      for (const arc of graph.iterAllArcs()) {
        if (!lengths.has(arc.src)) {
          continue
        }

        const newLen = lengths.get(arc.src) + arc.weight
        const oldLen = lengths.get(arc.dest)

        if (oldLen === undefined || newLen < oldLen) {
          lengths.set(arc.dest, newLen)
          ancestors.set(arc.dest, arc.src)
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
