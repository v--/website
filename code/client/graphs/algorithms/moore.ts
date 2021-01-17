import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'

export const moore: GraphAlgorithm<Num.UInt32> = Object.freeze({
  name: "Moore's algorithm",
  id: 'moore',
  type: GraphAlgorithmType.shortestPathTree,
  date: '2019-11-15',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends Num.UInt32>(graph: Graph<T>, start: T = 0 as T, _end: T) {
    const ancestors: TypeCons.NonStrictMap<T, T> = new Map()
    const lengths: TypeCons.NonStrictMap<T, Num.UInt32> = new Map()
    lengths.set(start, 0)
    const queue = [start]

    while (queue.length > 0) {
      const v = queue.shift()!

      for (const arc of graph.iterOutgoingArcs(v)) {
        const newLen = lengths.get(arc.src) + arc.weight
        const oldLen = lengths.get(arc.dest)

        if (oldLen === undefined || newLen < oldLen) {
          ancestors.set(arc.dest, arc.src)
          lengths.set(arc.dest, newLen)
          queue.push(arc.dest)
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
