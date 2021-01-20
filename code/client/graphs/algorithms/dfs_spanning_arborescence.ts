import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'

export const dfsSpanningArborescence: GraphAlgorithm<TNum.UInt32> = Object.freeze({
  name: 'DFS-generated arborescence',
  id: 'dfs_arborescence',
  type: GraphAlgorithmType.arborescence,
  date: '2019-11-30',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends TNum.UInt32>(graph: Graph<T>, start: T = 0 as T, _end: T) {
    const ancestors: TCons.NonStrictMap<T, T> = new Map()
    const marked = new Set<T>()
    const stack: Array<GraphArc<T>> = []

    for (const outArc of graph.getOutgoingArcs(start)) {
      stack.push(outArc)
    }

    while (stack.length > 0) {
      const arc = stack.pop()!
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

    return new GraphAlgorithmResult({
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
