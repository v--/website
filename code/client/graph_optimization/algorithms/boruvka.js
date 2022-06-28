import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'
import { labelComponents } from '../../../common/math/graphs/components.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {Graph<T>} tree
 * @param {TGraphOpt.IGraphComponentMap<T>} components
 * @param {TNum.UInt32} componentCount
 */
function addSafe(graph, tree, components, componentCount) {
  /** @type {Map<TNum.UInt32, GraphArc<T>>} */
  const safe = new Map()

  for (const arc of graph.iterAllArcs()) {
    const cu = components.get(arc.src)
    const cv = components.get(arc.dest)

    if (cu === cv) {
      continue
    }

    if (!safe.has(cu) || arc.weight < (/** @type {GraphArc<T>} */ (safe.get(cu))).weight) {
      safe.set(cu, arc)
    } else if (!safe.has(cv) || arc.weight < (/** @type {GraphArc<T>} */ (safe.get(cv))).weight) {
      safe.set(cv, arc)
    }
  }

  for (let c = 0; c < componentCount; c++) {
    const arc = safe.get(c)

    if (arc && !tree.hasArc(arc.src, arc.dest)) {
      tree.addArc(arc)
    }
  }
}

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const boruvka = Object.freeze({
  name: "Borůvka's algorithm",
  id: 'boruvka',
  type: 'minSpanningTree',
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_UNDIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  /**
   * @param {Graph<TNum.UInt32>} graph
   * @param {TNum.UInt32} _start
   * @param {TNum.UInt32} _end
   * @returns {TGraphOpt.IGraphAlgorithmResult<TNum.UInt32>}
   */
  run(graph, _start, _end) {
    /** @type {Graph<TNum.UInt32>} */
    const tree = Graph.empty(graph.order)
    let components = labelComponents(tree)
    let oldComponentCount = -1
    let componentCount = Math.max(...components.values()) + 1

    while (oldComponentCount !== componentCount) {
      addSafe(graph, tree, components, componentCount)
      components = labelComponents(graph)
      oldComponentCount = componentCount
      componentCount = Math.max(...components.values()) + 1
    }

    return {
      subgraph: tree,
      vertexData: new Map(),
      arcData: fillArcWeightData(graph)
    }
  }
})
