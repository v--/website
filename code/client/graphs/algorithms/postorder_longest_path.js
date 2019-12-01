import { schwartzMax } from '../../../common/support/iteration.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { postorder } from '../../../common/math/graphs/ordering.js'
import { constructPathFromAncestors } from '../../../common/math/graphs/ancestors.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillPathAncestorVertexData } from '../support/vertex_data.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const postorderLongestPath = Object.freeze({
  name: 'Longest path based on post-order traversal',
  id: 'postorder_longest_path',
  type: AlgorithmType.LONGEST_PATH,
  date: '2019-12-01',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, start = 0, end = graph.order - 1) {
    const order = postorder(graph)
    const lengths = new Map()
    const ancestors = new Map()

    for (const v of order) {
      if (v === end) {
        lengths.set(v, 0)
        continue
      }

      const arcs = graph.getOutgoingArcs(v)

      if (arcs.length === 0) {
        lengths.set(v, Number.NEGATIVE_INFINITY)
        continue
      }

      const max = schwartzMax(arc => lengths.get(arc.dest), arcs)
      ancestors.set(max.dest, v)
      lengths.set(v, lengths.get(max.dest) + max.weight)

      if (v === start) {
        break
      }
    }

    const subgraph = new Graph()
    const path = constructPathFromAncestors(graph, ancestors, start, end)

    if (path !== null) {
      for (const arc of path) {
        subgraph.addArc(arc)
      }
    }

    return new AlgorithmResult({
      start,
      end,
      subgraph,
      vertexData: fillPathAncestorVertexData(graph, ancestors, start),
      arcData: fillArcWeightData(graph)
    })
  }
})
