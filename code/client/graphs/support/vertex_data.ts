import { constructPathFromAncestors } from '../../../common/math/graphs/ancestors.js'
import { Graph } from '../../../common/math/graphs/graph.js'
import { NonStrictMap } from '../../../common/types/non_strict_map.js'
import { GraphAlgorithmDatum } from '../types/algorithm_data.js'

export type GraphAlgorithmVertexData<T> = Map<T, GraphAlgorithmDatum>

export function fillPathAncestorVertexData<T>(graph: Graph<T>, ancestors: NonStrictMap<T, T>, start: T): GraphAlgorithmVertexData<T> {
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
          value: weight
        }
      ])
    } else {
      vertexData.set(v, [])
    }
  }

  return vertexData
}
