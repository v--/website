import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const dfsSpanningArborescence = Object.freeze({
  name: 'DFS-generated arborescence',
  id: 'dfs_arborescence',
  type: 'arborescence',
  date: '2019-11-30',
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

    /** @type {Set<TNum.UInt32>} */
    const marked = new Set()

    /** @type {Array<GraphArc<TNum.UInt32>>} */
    const stack = []

    for (const outArc of graph.getOutgoingArcs(start)) {
      stack.push(outArc)
    }

    while (stack.length > 0) {
      const arc = /** @type {GraphArc<TNum.UInt32>} */ (stack.pop())
      const v = arc.dest

      if (marked.has(arc.dest)) {
        continue
      }

      marked.add(v)
      ancestors.set(v, arc.src)

      for (const outArc of graph.getOutgoingArcs(v)) {
        stack.push(outArc)
      }
    }

    return {
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    }
  }
})
