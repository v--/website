import { Graph } from '../../../common/math/graphs/graph.js'
import { GraphLayout } from '../../../common/math/graphs/types/layout.js'
import { GraphAlgorithmType } from '../enums/algorithm_type.js'
import { GraphAlgorithmResult } from '../support/algorithm_result.js'

export type GraphAlgorithmId =
  'dfs_arborescence' |
  'bfs_arborescence' |
  'prim' |
  'boruvka' |
  'kruskal' |
  'dijkstra' |
  'floyd' |
  'topological_shortest_path' |
  'bellman_ford' |
  'moore' |
  'postorder_longest_path' |
  'ford_fulkerson' 

export interface GraphAlgorithm<T> {
  name: string,
  id: GraphAlgorithmId,
  type: GraphAlgorithmType,
  date: TDates.ISODateString,
  graph: Graph<T>,
  layout: GraphLayout<T>,
  run(graph: Graph<T>, start?: T, end?: T): GraphAlgorithmResult<T>
}
