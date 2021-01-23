import { constructPathFromAncestors } from '../../../common/math/graphs/ancestors.js'
import { Graph } from '../../../common/math/graphs/graph.js'

/**
 * @template T
 * @param {Graph<T>} graph
 * @param {TCons.NonStrictMap<T, T>} ancestors
 * @param {T} start
 * @returns {TGraphOpt.IGraphAlgorithmVertexData<T>}
 */
export function fillPathAncestorVertexData(graph, ancestors, start) {
  /** @type {TGraphOpt.IGraphAlgorithmVertexData<T>} */
  const vertexData = new Map()

  for (const v of graph.iterAllVertices()) {
    const path = constructPathFromAncestors(graph, ancestors, start, v)

    if (path) {
      let weight = 0

      for (const arc of path) {
        weight += arc.weight
      }

      vertexData.set(v, [
        {
          label: 'Optimal path',
          value: [start].concat(path.map(p => p.dest)).join(' -> ')
        },
        {
          label: 'Optimal path weight',
          value: String(weight)
        }
      ])
    } else {
      vertexData.set(v, [])
    }
  }

  return vertexData
}
