import { Graph } from '../../../common/math/graphs/graph.js'
import { schwartzSort } from '../../../common/support/iteration.js'
import { labelComponents } from '../../../common/math/graphs/components.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const kruskal = Object.freeze({
  name: "Kruskal's algorithm",
  id: 'kruskal',
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
    const tree = Graph.empty(graph.order)
    const arcs = schwartzSort(arc => /** @type {TNum.UInt32} */ (arc.weight), graph.iterAllArcs())
    const components = labelComponents(tree)

    for (const arc of arcs) {
      if (components.get(arc.src) !== components.get(arc.dest)) {
        const oldComponent = components.get(arc.dest)
        const newComponent = components.get(arc.src)

        for (const [v, component] of components.entries()) {
          if (component === oldComponent) {
            components.set(v, newComponent)
          }
        }

        tree.addArc(arc)
      }
    }

    return {
      subgraph: tree,
      vertexData: new Map(),
      arcData: fillArcWeightData(graph)
    }
  }
})
