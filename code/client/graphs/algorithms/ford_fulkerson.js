import { map } from '../../../common/support/iteration.js'
import { findPath } from '../../../common/math/graphs/paths.js'
import { Graph } from '../../../common/math/graphs/graph.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillMaxFlowSummary } from '../support/summary.js'
import { AlgorithmResult } from '../support/algorithm_result.js'
import { AlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

export const fordFulkerson = Object.freeze({
  name: "Ford and Fulkerson's algorithm",
  id: 'ford_fulkerson',
  type: AlgorithmType.MAXIMUM_FLOW,
  date: '2019-12-03',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run (graph, start = 0, end = graph.order - 1) {
    const undirected = graph.getSymmetricClosure()
    let path = findPath(graph, start, end)
    let flow = new Map(map(a => [a, 0], undirected.iterAllArcs()))
    let capacities = new Map(map(a => [a, a.weight], undirected.iterAllArcs()))
    let reduced = graph

    if (path === null || path.length === 0) {
      return new AlgorithmResult({
        start,
        end,
        subgraph: new Graph(),
        arcData: fillArcWeightData(graph),
        summary: fillMaxFlowSummary(graph, 0)
      })
    }

    let pathMaxFlow = Math.min(...path.map(a => a.weight))

    while (true) { // eslint-disable-line no-constant-condition
      // Calculate new capacities
      const newCapacities = new Map()

      for (const arc of reduced.iterAllArcs()) {
        newCapacities.set(arc, capacities.get(arc) - flow.get(arc))
      }

      // Calculate new flow
      const newFlow = new Map()

      for (const arc of path) {
        const rev = reduced.getArc(arc.dest, arc.src)
        newFlow.set(arc, flow.get(arc) + pathMaxFlow)

        if (rev !== null) {
          newFlow.set(rev, flow.get(rev) - pathMaxFlow)
        }
      }

      // Calculate new reduced graph and path
      const newReduced = Graph.empty(graph.order)

      for (const arc of reduced.iterAllArcs()) {
        if (capacities.get(arc) > 0) {
          newReduced.addArc(arc)
        }
      }

      const newPath = findPath(newReduced, start, end)

      if (newPath === null) {
        return new AlgorithmResult({
          start,
          end,
          subgraph: Graph.fromArcs(path),
          arcData: fillArcWeightData(graph),
          summary: fillMaxFlowSummary(graph, pathMaxFlow)
        })
      } else {
        // Calculate max flow for previous values
        pathMaxFlow = Math.min(...path.map(a => capacities.get(a)))

        capacities = newCapacities
        reduced = newReduced
        flow = newFlow
        path = newPath
      }
    }
  }
})
