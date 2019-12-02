import { subgraphFromAncestorMap } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const moore = Object.freeze({
  name: "Moore's algorithm",
  id: 'moore',
  type: AlgorithmType.SHORTEST_PATH_TREE,
  date: '2019-11-15',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, start = 0, _end) {
    const ancestors = new Map()
    const lengths = new Map()
    lengths.set(start, 0)
    const queue = [start]

    while (queue.length > 0) {
      const v = queue.shift()

      for (const arc of graph.iterOutgoingArcs(v)) {
        const newLen = lengths.get(arc.src) + arc.weight
        const oldLen = lengths.get(arc.dest)

        if (oldLen === undefined || newLen < oldLen) {
          ancestors.set(arc.dest, arc.src)
          lengths.set(arc.dest, newLen)
          queue.push(arc.dest)
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
