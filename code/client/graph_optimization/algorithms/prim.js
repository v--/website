import { BinaryHeap } from '../../../common/containers/binary_heap.js'
import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'
import { Graph } from '../../../common/math/graphs/graph.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const prim = Object.freeze({
  name: "Prim's algorithm",
  id: 'prim',
  type: 'minSpanningTree',
  date: '2019-11-30',
  graph: DEFAULT_GRAPH_UNDIRECTED,
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

    /** @type {BinaryHeap<TNum.UInt32>} */
    const queue = new BinaryHeap()
    queue.insert(start, 0)

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

    return {
      start: start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    }
  }
})
