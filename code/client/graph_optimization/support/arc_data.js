import { Graph } from '../../../common/math/graphs/graph.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @returns {TGraphOpt.IGraphAlgorithmArcData<T>}
 */
export function fillArcWeightData(graph) {
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
