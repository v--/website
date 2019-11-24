import { Graph } from '../../common/math/graphs/graph.js'

export const DEFAULT_GRAPH = Graph.fromArcData([
  { src: 0, dest: 1, weight: 1 },
  { src: 0, dest: 2, weight: 2 },
  { src: 1, dest: 3, weight: 2 },
  { src: 1, dest: 5, weight: 1 },
  { src: 2, dest: 4, weight: 3 },
  { src: 2, dest: 6, weight: 2 },
  { src: 3, dest: 9, weight: 1 },
  { src: 4, dest: 7, weight: 2 },
  { src: 4, dest: 9, weight: 1 },
  { src: 5, dest: 9, weight: 3 },
  { src: 6, dest: 4, weight: 2 },
  { src: 6, dest: 7, weight: 3 },
  { src: 8, dest: 7, weight: 5 }
])
