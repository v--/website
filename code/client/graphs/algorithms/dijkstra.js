import { getForceDirectedLayout } from '../../../common/math/graphs/layout/force_directed.js'
import { BinaryHeap } from '../../../common/containers/binary_heap.js'

import { digestAncestorsAndCumLengths } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH } from '../graphs.js'

export const dijkstra = Object.freeze({
  name: "Dijsktra's algorithm",
  type: AlgorithmType.SHORTEST_PATH,
  date: '2019-11-15',
  getLayout: getForceDirectedLayout,
  graph: DEFAULT_GRAPH,

  run (graph, start = 0, end = graph.order - 1) {
    const ancestors = new Map()
    const cumLengths = new Map()
    const queue = new BinaryHeap()

    queue.insert(start, 0)

    for (let v = 1; v < graph.order; v++) {
      queue.insert(v, Number.POSITIVE_INFINITY)
      cumLengths.set(v, Number.POSITIVE_INFINITY)
    }

    while (!queue.isEmpty) {
      const min = queue.pop()

      for (const arc of graph.getOutcomingArcs(min.item)) {
        if (!queue.hasItem(arc.dest)) {
          continue
        }

        const currLen = queue.getItemWeight(arc.dest)
        const newLen = min.weight + arc.weight

        if (newLen < currLen) {
          queue.updateItemWeight(arc.dest, newLen)
          cumLengths.set(arc.dest, newLen)
          ancestors.set(arc.dest, min.item)
        }
      }
    }

    return digestAncestorsAndCumLengths(graph, start, end, ancestors)
  }
})
