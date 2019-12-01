import { constructShortestPathAncestorMap } from '../../../common/math/graphs/paths.js'
import { ancestorMapToArcs } from '../support/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const prim = Object.freeze({
  name: "Prim's algorithm",
  type: AlgorithmType.SPANNING_ARBORESCENCE,
  date: '2019-11-30',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, root = 0) {
    const ancestors = constructShortestPathAncestorMap(graph, root)

    return new AlgorithmResult({
      start: root,
      highlightedArcs: ancestorMapToArcs(graph, ancestors, root),
      vertexData: fillPathAncestorVertexData(graph, ancestors, root),
      arcData: fillArcWeightData(graph)
    })
  }
})
