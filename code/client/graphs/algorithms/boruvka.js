import { Graph } from '../../../common/math/graphs/graph.js'
import { labelComponents } from '../../../common/math/graphs/components.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_UNDIRECTED } from '../graphs.js'

function addSafe (graph, tree, components, componentCount) {
  const safe = new Map()

  for (const arc of graph.iterAllArcs()) {
    const cu = components.get(arc.src)
    const cv = components.get(arc.dest)

    if (cu === cv) {
      continue
    }

    if (!safe.has(cu) || arc.weight < safe.get(cu)) {
      safe.set(cu, arc)
    } else if (!safe.has(cv) || arc.weight < safe.get(cv)) {
      safe.set(cv, arc)
    }
  }

  for (let c = 0; c < componentCount; c++) {
    tree.addArc(safe.get(c))
  }
}

export const boruvka = Object.freeze({
  name: "Borůvka's algorithm",
  type: AlgorithmType.MIN_SPANNING_TREE,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_UNDIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph) {
    const tree = Graph.empty(graph.order)
    let components = labelComponents(tree)
    let componentCount = Math.max(...components.values()) + 1

    while (componentCount > 1) {
      addSafe(graph, tree, components, componentCount)
      components = labelComponents(graph, tree, components)
      componentCount = Math.max(...components.values()) + 1
    }

    return new AlgorithmResult({
      highlightedArcs: tree.getAllArcs(),
      vertexData: new Map(),
      arcData: fillArcWeightData(graph)
    })
  }
})
