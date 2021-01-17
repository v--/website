import { Graph } from '../../../common/math/graphs/graph.js'
import { schwartzSort } from '../../../common/support/iteration.js'
import { labelComponents } from '../../../common/math/graphs/components.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'

export const kruskal: GraphAlgorithm<Num.UInt32> = Object.freeze({
  name: "Kruskal's algorithm",
  id: 'kruskal',
  type: GraphAlgorithmType.minSpanningTree,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_UNDIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends Num.UInt32>(graph: Graph<T>, _start: T, _end: T) {
    const tree = Graph.empty(graph.order)
    const arcs = schwartzSort(arc => arc.weight as T, graph.iterAllArcs())
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

    return new GraphAlgorithmResult({
      subgraph: tree,
      vertexData: new Map(),
      arcData: fillArcWeightData(graph)
    })
  }
})
