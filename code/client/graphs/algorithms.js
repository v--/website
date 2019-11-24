import { dijkstra } from './algorithms/dijkstra.js'
import { floyd } from './algorithms/floyd.js'

import { AlgorithmType } from './enums/algorithm_type.js'

export const algorithms = Object.freeze([
  {
    type: AlgorithmType.SHORTEST_PATH,
    label: 'Shortest path',
    algorithms: [
      dijkstra,
      floyd
    ]
  }
])
