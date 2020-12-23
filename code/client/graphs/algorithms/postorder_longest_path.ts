import { schwartzMax } from '../../../common/support/iteration.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { postorder } from '../../../common/math/graphs/ordering.js'
import { constructPathFromAncestors } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { uint32 } from '../../../common/types/numeric.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { NonStrictMap } from '../../../common/types/non_strict_map.js'

export const postorderLongestPath: GraphAlgorithm<uint32> = Object.freeze({
  name: 'Longest path based on post-order traversal',
  id: 'postorder_longest_path',
  type: GraphAlgorithmType.longestPath,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends uint32>(graph: Graph<T>, start: T = 0 as T, end: T = graph.order - 1 as T) {
    const lengths = new Map()
    const ancestors: NonStrictMap<T, T> = new Map()

    const order = postorder(graph, start)
    const chain = new Set(order.slice(
      order.indexOf(end),
      order.indexOf(start) + 1
    ))

    for (const v of order) {
      if (v === end) {
        lengths.set(v, 0)
      } else {
        lengths.set(v, Number.NEGATIVE_INFINITY)

        const arcs = graph.getOutgoingArcs(v)
          .filter(arc => chain.has(arc.src))

        if (arcs.length === 0) {
          continue
        }

        const max = schwartzMax(arc => lengths.get(arc.dest) + arc.weight, arcs, false)
        ancestors.set(max.dest, v)
        lengths.set(v, lengths.get(max.dest) + max.weight)
      }
    }

    const subgraph = new Graph<T>()
    const path = constructPathFromAncestors(graph, ancestors, start, end)

    if (path) {
      for (const arc of path) {
        subgraph.addArc(arc)
      }
    }

    return new GraphAlgorithmResult({
      start,
      end,
      subgraph,
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
