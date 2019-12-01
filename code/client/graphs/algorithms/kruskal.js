import { Graph } from '../../../common/math/graphs/graph.js'
import { schwartzSort } from '../../../common/support/iteration.js'
import { labelComponents } from '../../../common/math/graphs/components.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'

export const kruskal = Object.freeze({
  name: "Kruskal's algorithm",
  id: 'kruskal',
  type: AlgorithmType.MIN_SPANNING_TREE,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_UNDIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, _start, _end) {
    const tree = Graph.empty(graph.order)
    const arcs = schwartzSort(arc => arc.weight, graph.iterAllArcs())
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

    return new AlgorithmResult({
      subgraph: tree,
      vertexData: new Map(),
      arcData: fillArcWeightData(graph)
    })
  }
})
