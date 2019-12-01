import { ancestorMapToArcs } from '../support/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const dfsSpanningArborescence = Object.freeze({
  name: 'DFS-generated arborescence',
  type: AlgorithmType.ARBORESCENCE,
  date: '2019-11-30',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, root = 0) {
    const ancestors = new Map()
    const marked = new Set()
    const stack = []

    for (const outArc of graph.getOutgoingArcs(root)) {
      stack.push(outArc)
    }

    while (stack.length > 0) {
      const arc = stack.pop()
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

    return new AlgorithmResult({
      start: root,
      highlightedArcs: ancestorMapToArcs(graph, ancestors, root),
      vertexData: fillPathAncestorVertexData(graph, ancestors, root),
      arcData: fillArcWeightData(graph)
    })
  }
})
