import { Graph } from '../../../common/math/graphs/graph.js'
import { repr } from '../../../common/support/strings.js'
import { GraphAlgorithmDatum } from '../types/algorithm_data.js'

export type GraphAlgorithmSummary = GraphAlgorithmDatum[]

export function fillMaxFlowSummary<T>(_graph: Graph<T>, maxFlow: Num.Float64): GraphAlgorithmDatum[] {
  return [
    {
      label: 'Maximum flow',
      value: repr(maxFlow)
    }
  ]
}
