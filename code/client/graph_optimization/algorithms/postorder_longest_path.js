import { schwartzMax } from '../../../common/support/iteration.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { postorder } from '../../../common/math/graphs/ordering.js'
import { constructPathFromAncestors } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const postorderLongestPath = Object.freeze({
  name: 'Longest path based on post-order traversal',
  id: 'postorder_longest_path',
  type: 'longestPath',
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  /**
   * @param {Graph<TNum.UInt32>} graph
   * @param {TNum.UInt32} start
   * @param {TNum.UInt32} end
   */
  run(graph, start = 0, end = graph.order - 1) {
    /** @type {TCons.NonStrictMap<TNum.UInt32, TNum.Float64>} */
    const lengths = new Map()

    /** @type {TCons.NonStrictMap<TNum.UInt32, TNum.UInt32>} */
    const ancestors = new Map()

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

    /** @type {Graph<TNum.UInt32>} */
    const subgraph = new Graph()
    const path = constructPathFromAncestors(graph, ancestors, start, end)

    if (path) {
      for (const arc of path) {
        subgraph.addArc(arc)
      }
    }

    return {
      start,
      end,
      subgraph,
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    }
  }
})
