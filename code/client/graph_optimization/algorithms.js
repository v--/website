import { dfsSpanningArborescence } from './algorithms/dfs_spanning_arborescence.js'
import { bfsSpanningArborescence } from './algorithms/bfs_spanning_arborescence.js'

import { prim } from './algorithms/prim.js'
import { kruskal } from './algorithms/kruskal.js'
import { boruvka } from './algorithms/boruvka.js'

import { dijkstra } from './algorithms/dijkstra.js'
import { floyd } from './algorithms/floyd.js'
import { topologicalShortestPath } from './algorithms/topological_shortest_path.js'
import { bellmanFord } from './algorithms/bellman_ford.js'
import { moore } from './algorithms/moore.js'

import { postorderLongestPath } from './algorithms/postorder_longest_path.js'

import { fordFulkerson } from './algorithms/ford_fulkerson.js'

/**
 * @type {Array<{
    type: TGraphOpt.AlgorithmType
    label: string,
    algorithms: Array<TGraphOpt.IGraphAlgorithm<TNum.UInt32>>
  }>}
 */
export const algorithms = [
  {
    type: 'arborescence',
    label: 'Arborescences',
    algorithms: [
      dfsSpanningArborescence,
      bfsSpanningArborescence
    ]
  },

  {
    type: 'minSpanningTree',
    label: 'Minimum spanning trees',
    algorithms: [
      prim,
      kruskal,
      boruvka
    ]
  },

  {
    type: 'shortestPathTree',
    label: 'Shortest path trees',
    algorithms: [
      dijkstra,
      floyd,
      topologicalShortestPath,
      bellmanFord,
      moore
    ]
  },

  {
    type: 'longestPath',
    label: 'Longest paths',
    algorithms: [
      postorderLongestPath
    ]
  },

  {
    type: 'maximumFlow',
    label: 'Maximum flows',
    algorithms: [
      fordFulkerson
    ]
  }
]

export const DEFAULT_ALGORITHM = dfsSpanningArborescence
