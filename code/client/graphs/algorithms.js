import { dijkstra } from './algorithms/dijkstra.js'
import { floyd } from './algorithms/floyd.js'
import { dfsSpanningArborescence } from './algorithms/dfs_spanning_arborescence.js'
import { bfsSpanningArborescence } from './algorithms/bfs_spanning_arborescence.js'
import { prim } from './algorithms/prim.js'
import { boruvka } from './algorithms/boruvka.js'
import { kruskal } from './algorithms/kruskal.js'
import { postorderLongestPath } from './algorithms/postorder_longest_path.js'

import { AlgorithmType } from './enums/algorithm_type.js'

export const algorithms = Object.freeze([
  {
    type: AlgorithmType.ARBORESCENCE,
    label: 'Arborescences',
    algorithms: [
      dfsSpanningArborescence,
      bfsSpanningArborescence
    ]
  },

  {
    type: AlgorithmType.MIN_SPANNING_TREE,
    label: 'Minimum spanning trees',
    algorithms: [
      prim,
      kruskal,
      boruvka
    ]
  },

  {
    type: AlgorithmType.SHORTEST_PATH_TREE,
    label: 'Shortest path trees',
    algorithms: [
      dijkstra,
      floyd
    ]
  },

  {
    type: AlgorithmType.LONGEST_PATH,
    label: 'Longest paths',
    algorithms: [
      postorderLongestPath
    ]
  }
])

export const DEFAULT_ALGORITHM = algorithms[3].algorithms[0]
