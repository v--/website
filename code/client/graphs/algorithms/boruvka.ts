import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'
import { GraphComponentMap, labelComponents } from '../../../common/math/graphs/components.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'

function addSafe<T>(graph: Graph<T>, tree: Graph<T>, components: GraphComponentMap<T>, componentCount: Num.UInt32) {
  const safe = new Map<Num.UInt32, GraphArc<T>>()

  for (const arc of graph.iterAllArcs()) {
    const cu = components.get(arc.src)
    const cv = components.get(arc.dest)

    if (cu === cv) {
      continue
    }

    if (!safe.has(cu) || arc.weight < safe.get(cu)!.weight) {
      safe.set(cu, arc)
    } else if (!safe.has(cv) || arc.weight < safe.get(cv)!.weight) {
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

export const boruvka: GraphAlgorithm<Num.UInt32> = Object.freeze({
  name: "Borůvka's algorithm",
  id: 'boruvka',
  type: GraphAlgorithmType.minSpanningTree,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_UNDIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends Num.UInt32>(graph: Graph<T>, _start?: T, _end?: T) {
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

    return new GraphAlgorithmResult({
      subgraph: tree,
      vertexData: new Map(),
      arcData: fillArcWeightData(graph)
    })
  }
})
