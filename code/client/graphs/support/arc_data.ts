import { Graph, GraphArc } from '../../../common/math/graphs/graph.js'
import { NonStrictMap } from '../../../common/types/non_strict_map.js'
import { GraphAlgorithmDatum } from '../types/algorithm_data.js'

export type GraphAlgorithmArcData<T> = Map<GraphArc<T>, GraphAlgorithmDatum>

export function fillArcWeightData<T>(graph: Graph<T>): GraphAlgorithmArcData<T> {
  const data = new Map()

  for (const arc of graph.iterAllArcs()) {
    data.set(arc, [
      {
        label: 'Arc weight',
        value: arc.weight
      }
    ])
  }

  return data
}
