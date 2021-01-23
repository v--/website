import { map } from '../../../common/support/iteration.js'
import { findPath } from '../../../common/math/graphs/paths.js'
import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'

import { fillArcWeightData } from '../support/arc_data.js'
import { fillMaxFlowSummary } from '../support/summary.js'
import { DEFAULT_GRAPH_LAYOUT, DEFAULT_GRAPH_DIRECTED } from '../graphs.js'

/** @type {TGraphOpt.IGraphAlgorithm<TNum.UInt32>} */
export const fordFulkerson = Object.freeze({
  name: "Ford and Fulkerson's algorithm",
  id: 'ford_fulkerson',
  type: 'maximumFlow',
  date: '2019-12-03',
  graph: DEFAULT_GRAPH_DIRECTED,
  layout: DEFAULT_GRAPH_LAYOUT,

  /**
   * @param {Graph<TNum.UInt32>} graph
   * @param {TNum.UInt32} start
   * @param {TNum.UInt32} end
   */
  run(graph, start = 0, end = graph.order - 1) {
    const undirected = graph.getSymmetricClosure()
    const possiblyPath = findPath(graph, start, end)
    let flow = /** @type {TCons.NonStrictMap<GraphArc<TNum.UInt32>, TNum.Float64>} */ (
      new Map(map(a => [a, 0], undirected.iterAllArcs()))
    )

    let capacities = /** @type {TCons.NonStrictMap<GraphArc<TNum.UInt32>, TNum.Float64>} */ (
      new Map(map(a => [a, a.weight], undirected.iterAllArcs()))
    )

    let reduced = graph

    if (possiblyPath === undefined || possiblyPath.length === 0) {
      return {
        start,
        end,
        subgraph: new Graph(),
        vertexData: new Map(),
        arcData: fillArcWeightData(graph),
        summary: fillMaxFlowSummary(graph, 0)
      }
    }

    /** @type {Array<GraphArc<TNum.UInt32>>} */
    let path = possiblyPath
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
      /** @type {Graph<TNum.UInt32>} */
      const newReduced = Graph.empty(graph.order) 

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
        return {
          start,
          end,
          subgraph: Graph.fromArcs(path),
          vertexData: new Map(),
          arcData: fillArcWeightData(graph),
          summary: fillMaxFlowSummary(graph, pathMaxFlow)
        }
      }
    }
  }
})
