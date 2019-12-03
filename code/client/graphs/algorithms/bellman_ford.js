import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const bellmanFord = Object.freeze({
  name: "Bellman and Ford's algorithm",
  id: 'bellman_ford',
  type: AlgorithmType.SHORTEST_PATH_TREE,
  date: '2019-11-15',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, start = 0, _end) {
    const ancestors = new Map()
    const lengths = new Map()
    lengths.set(start, 0)

    for (let i = 1; i < graph.order; i++) {
      for (const arc of graph.iterAllArcs()) {
        if (!lengths.has(arc.src)) {
          continue
        }

        const newLen = lengths.get(arc.src) + arc.weight
        const oldLen = lengths.get(arc.dest)

        if (oldLen === undefined || newLen < oldLen) {
          lengths.set(arc.dest, newLen)
          ancestors.set(arc.dest, arc.src)
        }
      }
    }

    return new AlgorithmResult({
      start,
      subgraph: subgraphFromAncestorMap(graph, ancestors),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
