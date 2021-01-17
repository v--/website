import { map } from '../../../common/support/iteration.js'
import { findPath } from '../../../common/math/graphs/paths.js'
import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillMaxFlowSummary } from '../support/summary.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'
import { GraphAlgorithm } from '../types/graph_algorithm.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'

export const fordFulkerson: GraphAlgorithm<Num.UInt32> = Object.freeze({
  name: "Ford and Fulkerson's algorithm",
  id: 'ford_fulkerson',
  type: GraphAlgorithmType.maximumFlow,
  date: '2019-12-03',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  run<T extends Num.UInt32>(graph: Graph<T>, start: T = 0 as T, end: T = graph.order - 1 as T) {
    const undirected = graph.getSymmetricClosure()
    const possiblyPath = findPath(graph, start, end)
    let flow = new Map(map(a => [a, 0], undirected.iterAllArcs())) as TypeCons.NonStrictMap<GraphArc<T>, Num.Float64>
    let capacities = new Map(map(a => [a, a.weight], undirected.iterAllArcs())) as TypeCons.NonStrictMap<GraphArc<T>, Num.Float64>
    let reduced = graph

    if (possiblyPath === undefined || possiblyPath.length === 0) {
      return new GraphAlgorithmResult({
        start,
        end,
        subgraph: new Graph<T>(),
        vertexData: new Map(),
        arcData: fillArcWeightData(graph),
        summary: fillMaxFlowSummary(graph, 0)
      })
    }

    let path: Array<GraphArc<T>> = possiblyPath
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

        if (rev) {
          newFlow.set(rev, flow.get(rev) - pathMaxFlow)
        }
      }

      // Calculate new reduced graph and path
      const newReduced = Graph.empty(graph.order) as Graph<T>

      for (const arc of reduced.iterAllArcs()) {
        if (capacities.get(arc) > 0) {
          newReduced.addArc(arc)
        }
      }

      const newPath = findPath(newReduced, start, end)

      if (newPath) {
        // Calculate max flow for previous values
        pathMaxFlow = Math.min(...path.map(a => capacities.get(a)))

        capacities = newCapacities
        reduced = newReduced
        flow = newFlow
        path = newPath
      } else {
        return new GraphAlgorithmResult({
          start,
          end,
          subgraph: Graph.fromArcs(path),
          vertexData: new Map(),
          arcData: fillArcWeightData(graph),
          summary: fillMaxFlowSummary(graph, pathMaxFlow)
        })
      }
    }
  }
})
