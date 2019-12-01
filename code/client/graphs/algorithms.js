import { dijkstra } from './algorithms/dijkstra.js'
import { floyd } from './algorithms/floyd.js'
import { dfsSpanningArborescence } from './algorithms/dfs_spanning_arborescence.js'
import { bfsSpanningArborescence } from './algorithms/bfs_spanning_arborescence.js'
import { prim } from './algorithms/prim.js'

import { AlgorithmType } from './enums/algorithm_type.js'

export const algorithms = Object.freeze([
  {
    type: AlgorithmType.SPANNING_ARBORESCENCE,
    label: 'Spanning arborescence',
    algorithms: [
      dfsSpanningArborescence,
      bfsSpanningArborescence,
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
