import { dijkstra } from './algorithms/dijkstra.js'
import { floyd } from './algorithms/floyd.js'
import { dfsSpanningTree } from './algorithms/dfs_spanning_tree.js'
import { bfsSpanningTree } from './algorithms/bfs_spanning_tree.js'
import { prim } from './algorithms/prim.js'

import { AlgorithmType } from './enums/algorithm_type.js'

export const algorithms = Object.freeze([
  {
    type: AlgorithmType.SPANNING_TREE,
    label: 'Spanning tree',
    algorithms: [
      dfsSpanningTree,
      bfsSpanningTree,
      prim
    ]
  },

  {
    type: AlgorithmType.SHORTEST_PATH,
    label: 'Shortest path',
    algorithms: [
      dijkstra,
      floyd
    ]
  }
])

export const DEFAULT_ALGORITHM = algorithms[0].algorithms[0]
