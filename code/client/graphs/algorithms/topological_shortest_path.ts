import { schwartzMin } from '../../../common/support/iteration.js'
import { topologicalOrder } from '../../../common/math/graphs/ordering.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'

export const topologicalShortestPath: GraphAlgorithm<Num.UInt32> = Object.freeze({
  name: 'Shortest path tree based on topological order',
  id: 'topological_shortest_path',
  type: GraphAlgorithmType.shortestPathTree,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends Num.UInt32>(graph: Graph<T>, start: T = 0 as T, _end?: T) {
    const ancestors: TypeCons.NonStrictMap<T, T> = new Map()
    const lengths: TypeCons.NonStrictMap<T, Num.UInt32> = new Map()

    const order = topologicalOrder(graph, start)
    const chain = order.slice(
      order.indexOf(start) + 1
    )

    lengths.set(start, 0)

    for (const v of chain) {
      const arcs = graph.getIncomingArcs(v).filter(arc => lengths.has(arc.src))

      if (arcs.length === 0) {
        continue
      }

      const min = schwartzMin(arc => lengths.get(arc.src)! + arc.weight, arcs, false)
      lengths.set(v, lengths.get(min.src)! + min.weight)
      ancestors.set(v, min.src)
    }

    return new GraphAlgorithmResult({
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
