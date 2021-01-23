import { schwartzMin } from '../../../common/support/iteration.js'
import { topologicalOrder } from '../../../common/math/graphs/ordering.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { Graph } from '../../../common/math/graphs/graph.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const topologicalShortestPath = Object.freeze({
  name: 'Shortest path tree based on topological order',
  id: 'topological_shortest_path',
  type: 'shortestPathTree',
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  /**
   * @param {Graph<TNum.UInt32>} graph
   * @param {TNum.UInt32} start
   * @param {TNum.UInt32} _end
   * @returns {TGraphOpt.IGraphAlgorithmResult<TNum.UInt32>}
   */
  run(graph, start = 0, _end) {
    /** @type {TCons.NonStrictMap<TNum.UInt32, TNum.UInt32>} */
    const ancestors = new Map()

    /** @type {TCons.NonStrictMap<TNum.UInt32, TNum.UInt32>} */
    const lengths = new Map()

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

      const min = schwartzMin(arc => lengths.get(arc.src) + arc.weight, arcs, false)
      lengths.set(v, lengths.get(min.src) + min.weight)
      ancestors.set(v, min.src)
    }

    return {
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    }
  }
})
