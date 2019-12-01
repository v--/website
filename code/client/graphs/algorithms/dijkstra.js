import { constructShortestPathAncestorMap } from '../../../common/math/graphs/paths.js'

import { constructPathFromAncestors } from '../support/ancestors.js'
import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const dijkstra = Object.freeze({
  name: "Dijsktra's algorithm",
  type: AlgorithmType.SHORTEST_PATH,
  date: '2019-11-15',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, start = 0, end = graph.order - 1) {
    const ancestors = constructShortestPathAncestorMap(graph, start)

    return new AlgorithmResult({
      start,
      end,
      highlightedArcs: constructPathFromAncestors(graph, ancestors, start, end),
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
