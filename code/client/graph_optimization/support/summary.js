import { Graph } from '../../../common/math/graphs/graph.js'
import { repr } from '../../../common/support/strings.js'

/**
 * @template T
 * @param {Graph<T>} _graph
 * @param {TNum.Float64} maxFlow
 * @returns {Array<TGraphOpt.IGraphAlgorithmDatum>}
 */
export function fillMaxFlowSummary(_graph, maxFlow) {
  return [
    {
      label: 'Maximum flow',
      value: repr(maxFlow)
    }
  ]
}
