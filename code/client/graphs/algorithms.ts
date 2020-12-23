import { GraphAlgorithmType } from './enums/algorithm_type.js'

import { dfsSpanningArborescence } from './algorithms/dfs_spanning_arborescence.js'
import { bfsSpanningArborescence } from './algorithms/bfs_spanning_arborescence.js'

import { prim } from './algorithms/prim.js'
import { boruvka } from './algorithms/boruvka.js'
import { kruskal } from './algorithms/kruskal.js'

import { dijkstra } from './algorithms/dijkstra.js'
import { floyd } from './algorithms/floyd.js'
import { bellmanFord } from './algorithms/bellman_ford.js'
import { moore } from './algorithms/moore.js'
import { topologicalShortestPath } from './algorithms/topological_shortest_path.js'

import { postorderLongestPath } from './algorithms/postorder_longest_path.js'

import { fordFulkerson } from './algorithms/ford_fulkerson.js'

export const algorithms = Object.freeze([
  {
    type: GraphAlgorithmType.arborescence,
    label: 'Arborescences',
    algorithms: [
      dfsSpanningArborescence,
      bfsSpanningArborescence
    ]
  },

  {
    type: GraphAlgorithmType.minSpanningTree,
    label: 'Minimum spanning trees',
    algorithms: [
      prim,
      kruskal,
      boruvka
    ]
  },

  {
    type: GraphAlgorithmType.shortestPathTree,
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
    type: GraphAlgorithmType.longestPath,
    label: 'Longest paths',
    algorithms: [
      postorderLongestPath
    ]
  },

  {
    type: GraphAlgorithmType.maximumFlow,
    label: 'Maximum flows',
    algorithms: [
      fordFulkerson
    ]
  }
])

export const DEFAULT_ALGORITHM = dfsSpanningArborescence
